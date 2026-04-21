import React from 'react';
import { Download, FileSpreadsheet, Users, Clock, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const AttendanceExport = ({ participants, meetingId, meetingName }) => {
  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const attendanceData = participants.map((participant, index) => ({
        'S.No': index + 1,
        'Name': participant.name,
        'User ID': participant.userId,
        'Joined At': new Date(participant.joinedAt).toLocaleString(),
        'Left At': participant.leftAt ? new Date(participant.leftAt).toLocaleString() : 'Still in meeting',
        'Duration (minutes)': participant.duration || 
          (participant.leftAt ? Math.floor((new Date(participant.leftAt) - new Date(participant.joinedAt)) / 60000) : 
          Math.floor((new Date() - new Date(participant.joinedAt)) / 60000)),
        'Status': participant.isActive ? 'Active' : 'Left',
        'Email': participant.email || 'N/A'
      }));

      // Add summary row
      const summary = {
        'S.No': '',
        'Name': 'TOTAL PARTICIPANTS',
        'User ID': attendanceData.length,
        'Joined At': '',
        'Left At': '',
        'Duration (minutes)': attendanceData.reduce((sum, p) => sum + p['Duration (minutes)'], 0),
        'Status': '',
        'Email': ''
      };
      
      attendanceData.push(summary);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(attendanceData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 8 },   // S.No
        { wch: 20 },  // Name
        { wch: 25 },  // User ID
        { wch: 20 },  // Joined At
        { wch: 20 },  // Left At
        { wch: 15 },  // Duration
        { wch: 10 },  // Status
        { wch: 25 }   // Email
      ];

      // Add meeting info header
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, 'Attendance');

      // Generate filename
      const filename = `attendance_${meetingName || meetingId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export
      XLSX.writeFile(workbook, filename);
      
      toast.success(`Attendance exported successfully! Total participants: ${attendanceData.length - 1}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export attendance');
    }
  };

  const getStats = () => {
    const active = participants.filter(p => p.isActive).length;
    const total = participants.length;
    const totalDuration = participants.reduce((sum, p) => sum + (p.duration || 0), 0);
    
    return { active, total, totalDuration };
  };

  const stats = getStats();

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Attendance Report
        </h3>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Excel
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Participants</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          <div className="text-xs text-gray-400">Active Now</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-500">{stats.totalDuration}</div>
          <div className="text-xs text-gray-400">Total Minutes</div>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-left py-2 px-2">Joined</th>
              <th className="text-left py-2 px-2">Duration</th>
              <th className="text-left py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, idx) => (
              <tr key={p.userId} className="border-b border-gray-700">
                <td className="py-2 px-2">{idx + 1}</td>
                <td className="py-2 px-2">{p.name}</td>
                <td className="py-2 px-2 text-xs">{new Date(p.joinedAt).toLocaleTimeString()}</td>
                <td className="py-2 px-2">
                  {p.duration || Math.floor((new Date() - new Date(p.joinedAt)) / 60000)} min
                </td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>
                    {p.isActive ? 'Active' : 'Left'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceExport;