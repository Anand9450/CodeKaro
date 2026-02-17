const contests = [
  { id: 1, title: 'Weekly Contest 1', date: 'Oct 25, 2026', time: '10:00 AM', duration: '1h 30m', status: 'Upcoming' },
  { id: 2, title: 'Biweekly Contest 2', date: 'Oct 28, 2026', time: '8:00 PM', duration: '2h', status: 'Upcoming' },
  { id: 3, title: 'Hackathon 101', date: 'Nov 1, 2026', time: '9:00 AM', duration: '12h', status: 'Upcoming' },
  { id: 4, title: 'Weekly Contest 0', date: 'Oct 18, 2026', time: '10:00 AM', duration: '1h 30m', status: 'Ended' },
];

const Contest = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Contests
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <div key={contest.id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition cursor-pointer flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold mb-1">{contest.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs text-white uppercase font-bold
                    ${contest.status === 'Upcoming' ? 'bg-green-600' : 'bg-gray-600'}
                  `}>
                    {contest.status}
                  </span>
                </div>

                <div className="text-gray-400 text-sm mb-4 space-y-1">
                  <p>📅 {contest.date}</p>
                  <p>⏰ {contest.time}</p>
                  <p>⏱ Duration: {contest.duration}</p>
                </div>
              </div>

              <button className={`w-full py-2 px-4 rounded font-bold transition
                ${contest.status === 'Upcoming' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
              `}>
                {contest.status === 'Upcoming' ? 'Register' : 'View Results'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contest;
