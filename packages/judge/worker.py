import time
import json
import redis
import docker
import os
import shutil

# Connect to Redis
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    redis_client.ping()
    print("Connected to Redis successfully.")
except redis.ConnectionError:
    print("Error: Could not connect to Redis. Please ensure Redis is running on localhost:6379")
    exit(1)

# Connect to Docker
try:
    docker_client = docker.from_env()
    docker_client.ping()
    print("Connected to Docker successfully.")
except docker.errors.DockerException:
    print("Error: Could not connect to Docker. Please ensure Docker Desktop is running.")
    exit(1)

SUBMISSION_QUEUE = 'submission_queue'

def ensure_image(image_name):
    try:
        docker_client.images.get(image_name)
    except docker.errors.ImageNotFound:
        print(f"Pulling image {image_name}...")
        docker_client.images.pull(image_name)
        print(f"Image {image_name} pulled.")

def process_submission(task_data):
    try:
        data = json.loads(task_data)
        code = data.get('code')
        language = data.get('language')
        test_cases = data.get('testCases', [])
        submission_id = data.get('submissionId', 'unknown')

        print(f"Processing submission {submission_id} for language: {language}")

        # Language config
        lang_config = {
            'python': {
                'image': 'python:3.9-slim',
                'file_ext': 'py',
                'run_cmd': 'python'
            },
            'javascript': {
                'image': 'node:18-alpine',
                'file_ext': 'js',
                'run_cmd': 'node'
            },
            'c': {
                'image': 'gcc:12',
                'file_ext': 'c',
                'compile_cmd': 'gcc solution.c -o solution',
                'run_cmd': './solution'
            },
            'cpp': {
                'image': 'gcc:12',
                'file_ext': 'cpp',
                'compile_cmd': 'g++ solution.cpp -o solution',
                'run_cmd': './solution'
            },
            'java': {
                'image': 'openjdk:17-jdk-alpine',
                'file_ext': 'java',
                'compile_cmd': 'javac Solution.java',
                'run_cmd': 'java Solution'
            }
        }
        
        config = lang_config.get(language)
        if not config:
            return {'verdict': 'Runtime Error', 'details': 'Language not supported'}

        ensure_image(config['image'])

        # Setup temp directory
        temp_dir = os.path.abspath(os.path.join(os.getcwd(), 'temp_submissions', str(submission_id)))
        os.makedirs(temp_dir, exist_ok=True)
        
        filename = f"Solution.{config['file_ext']}" if language == 'java' else f"solution.{config['file_ext']}"
        file_path = os.path.join(temp_dir, filename)
        
        with open(file_path, 'w') as f:
            f.write(code)

        # Compilation (if needed)
        if 'compile_cmd' in config:
            compile_cmd = f"/bin/sh -c '{config['compile_cmd']}'"
            print(f"Compiling: {compile_cmd}")
            try:
                compile_container = docker_client.containers.run(
                    config['image'],
                    compile_cmd,
                    volumes={temp_dir: {'bind': '/app', 'mode': 'rw'}}, # Read-write for compilation artifacts
                    working_dir='/app',
                    network_disabled=True,
                    remove=True
                )
            except docker.errors.ContainerError as e:
                shutil.rmtree(temp_dir, ignore_errors=True)
                return {'verdict': 'Compilation Error', 'details': e.stderr.decode('utf-8') if e.stderr else str(e)}
            except Exception as e:
                 shutil.rmtree(temp_dir, ignore_errors=True)
                 return {'verdict': 'Compilation Error', 'details': str(e)}

        total_time = 0
        total_test_cases = len(test_cases)
        results_details = []

        for i, test_case in enumerate(test_cases):
            input_val = test_case.get('input', '')
            expected_output = test_case.get('output', '').strip()
            
            input_filename = f"input_{i}.txt"
            input_path = os.path.join(temp_dir, input_filename)
            with open(input_path, 'w') as f:
                f.write(input_val)

            # Construct command: run solution with input redirected from file
            # Note: We mount the temp_dir to /app in the container
            cmd_prefix = '/bin/sh -c'
            # Adjust command for compiled binaries or scripts
            run_command_str = f"{config['run_cmd']} < /app/{input_filename}"
            container_cmd = f"{cmd_prefix} '{run_command_str}'"
            
            start_time = time.time()
            try:
                container = docker_client.containers.run(
                    config['image'],
                    container_cmd,
                    volumes={temp_dir: {'bind': '/app', 'mode': 'ro'}},
                    working_dir='/app',
                    mem_limit='256m',
                    network_disabled=True,
                    detach=True
                )
                
                result = container.wait(timeout=2) # 2 seconds timeout per test case
                execution_time = (time.time() - start_time) * 1000 # ms
                total_time += execution_time
                
                logs = container.logs().decode('utf-8').strip()
                container.remove()

                if result['StatusCode'] != 0:
                     shutil.rmtree(temp_dir, ignore_errors=True)
                     return {'verdict': 'Runtime Error', 'details': logs}
                
                if logs != expected_output:
                     shutil.rmtree(temp_dir, ignore_errors=True)
                     return {
                         'verdict': 'Wrong Answer', 
                         'details': f"Test Case {i+1} Failed.\nExpected: {expected_output}\nGot: {logs}",
                         'timeTaken': f"{execution_time:.2f}ms"
                     }
                
                results_details.append(f"Test case {i+1}: Passed ({execution_time:.2f}ms)")

            except Exception as e:
                # Cleanup container if it still exists (e.g. timeout)
                try:
                    container.remove(force=True)
                except:
                    pass
                shutil.rmtree(temp_dir, ignore_errors=True)
                return {'verdict': 'Time Limit Exceeded' if 'Read timed out' in str(e) else 'Runtime Error', 'details': str(e)}

        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        return {
            'verdict': 'Accepted', 
            'details': 'All test cases passed', 
            'stats': {
                'time': f"{total_time:.2f}ms",
                'memory': 'N/A' # Hard to measure without cgroups in this setup
            }
        }

    except json.JSONDecodeError:
        print("Error: Invalid JSON format")
        return {'verdict': 'Internal Error', 'details': 'Invalid Task Format'}
    except Exception as e:
        print(f"Error processing submission: {e}")
        return {'verdict': 'Internal Error', 'details': str(e)}

def main():
    print(f"Worker started. Listening on queue: {SUBMISSION_QUEUE}...")
    while True:
        try:
            # Blocking pop
            task = redis_client.blpop(SUBMISSION_QUEUE, timeout=0)
            if task:
                # task is (queue_name, data)
                task_data = task[1].decode('utf-8')
                result = process_submission(task_data)
                print("Result:", result)
                
                # Store result in Redis
                try:
                    data = json.loads(task_data)
                    submission_id = data.get('submissionId')
                    if submission_id:
                        redis_client.setex(
                            f"submission:{submission_id}",
                            3600,
                            json.dumps(result)
                        )
                except Exception as e:
                    print(f"Error storing result: {e}")
        except redis.ConnectionError:
            print("Redis connection lost. Retrying in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(1)

if __name__ == '__main__':
    main()
