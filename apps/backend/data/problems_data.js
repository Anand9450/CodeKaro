
const problems = [
  {
    "id": 1,
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "examples": [
      {
        "input": "nums = [2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    "testCases": [
      {
        "input": "{\"nums\":[2,7,11,15],\"target\":9}",
        "output": "[0, 1]"
      },
      {
        "input": "{\"nums\":[3,2,4],\"target\":6}",
        "output": "[1, 2]"
      },
      {
        "input": "{\"nums\":[3,3],\"target\":6}",
        "output": "[0, 1]"
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n}",
      "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}",
      "python": "def twoSum(nums, target):\n    # Write your code here",
      "javascript": "function twoSum(nums, target) {\n  // Write your code here\n}"
    }
  },
  {
    "id": 2,
    "title": "Add Two Numbers",
    "description": "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    "difficulty": "Medium",
    "examples": [
      {
        "input": "l1 = [2,4,3], l2 = [5,6,4]",
        "output": "[7,0,8]",
        "explanation": "342 + 465 = 807."
      }
    ],
    "testCases": [
      {
        "input": "{\"l1\":[2,4,3],\"l2\":[5,6,4]}",
        "output": "[7,0,8]"
      },
      {
        "input": "{\"l1\":[0],\"l2\":[0]}",
        "output": "[0]"
      }
    ],
    "starterCode": {
      "c": "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     struct ListNode *next;\n * };\n */\nstruct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {\n    \n}",
      "cpp": "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};",
      "java": "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        \n    }\n}",
      "python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        ",
      "javascript": "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} l1\n * @param {ListNode} l2\n * @return {ListNode}\n */\nvar addTwoNumbers = function(l1, l2) {\n    \n};"
    }
  },
  {
    "id": 3,
    "title": "Longest Substring Without Repeating Characters",
    "description": "Given a string s, find the length of the longest substring without repeating characters.",
    "difficulty": "Medium",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      }
    ],
    "testCases": [
      {
        "input": "\"abcabcbb\"",
        "output": "3"
      },
      {
        "input": "\"bbbbb\"",
        "output": "1"
      },
      {
        "input": "\"pwwkew\"",
        "output": "3"
      }
    ],
    "starterCode": {
      "c": "int lengthOfLongestSubstring(char * s){\n    \n}",
      "cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};",
      "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}",
      "python": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ",
      "javascript": "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};"
    }
  },
  {
    "id": 4,
    "title": "Median of Two Sorted Arrays",
    "description": "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    "difficulty": "Hard",
    "examples": [
      {
        "input": "nums1 = [1,3], nums2 = [2]",
        "output": "2.00000",
        "explanation": "merged array = [1,2,3] and median is 2."
      }
    ],
    "testCases": [
      {
        "input": "{\"nums1\":[1,3],\"nums2\":[2]}",
        "output": "2.00000"
      },
      {
        "input": "{\"nums1\":[1,2],\"nums2\":[3,4]}",
        "output": "2.50000"
      }
    ],
    "starterCode": {
      "c": "double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size){\n    \n}",
      "cpp": "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};",
      "java": "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}",
      "python": "class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        ",
      "javascript": "/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nvar findMedianSortedArrays = function(nums1, nums2) {\n    \n};"
    }
  },
  {
    "id": 5,
    "title": "Longest Palindromic Substring",
    "description": "Given a string s, return the longest palindromic substring in s.",
    "difficulty": "Medium",
    "examples": [
      {
        "input": "s = \"babad\"",
        "output": "\"bab\"",
        "explanation": "\"aba\" is also a valid answer."
      }
    ],
    "testCases": [
      {
        "input": "\"babad\"",
        "output": "\"bab\""
      },
      {
        "input": "\"cbbd\"",
        "output": "\"bb\""
      }
    ],
    "starterCode": {
      "c": "char * longestPalindrome(char * s){\n    \n}",
      "cpp": "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        \n    }\n};",
      "java": "class Solution {\n    public String longestPalindrome(String s) {\n        \n    }\n}",
      "python": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        ",
      "javascript": "/**\n * @param {string} s\n * @return {string}\n */\nvar longestPalindrome = function(s) {\n    \n};"
    }
  }
]
module.exports = { problems };
