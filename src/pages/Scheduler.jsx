import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Video, Plus, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Scheduler = () => {
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    meetingName: '',
    meetingId: '',
    date: '',
    time: '',
    duration: 60,
    password: '',
    description: '',
    participants: []
  });

  useEffect(() => {
    loadScheduledMeetings();
  }, []);

  const loadScheduledMeetings = () => {
    const saved = localStorage.getItem('scheduledMeetings');
    if (saved) {
      setScheduledMeetings(JSON.parse(saved));
    }
  };

  const saveScheduledMeetings = (meetings) => {
    localStorage.setItem('scheduledMeetings', JSON.stringify(meetings));
    setScheduledMeetings(meetings);
  };

  const generateMeetingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateSchedule = async () => {
    if (!formData.meetingName || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }

    const meetingId = formData.meetingId || generateMeetingId();
    const meetingDateTime = new Date(`${formData.date}T${formData.time}`);

    const newMeeting = {
      id: Date.now(),
      meetingId,
      meetingName: formData.meetingName,
      date: formData.date,
      time: formData.time,
      datetime: meetingDateTime,
      duration: formData.duration,
      password: formData.password,
      description: formData.description,
      status: 'scheduled',
      createdAt: new Date()
    };

    // Create meeting on server
    try {
      await axios.post('http://localhost:5000/api/meetings/create', {
        meetingId,
        meetingName: formData.meetingName,
        password: formData.password,
        createdBy: 'Scheduler'
      });

      const updatedMeetings = [...scheduledMeetings, newMeeting];
      saveScheduledMeetings(updatedMeetings);
      toast.success('Meeting scheduled successfully!');
      setShowForm(false);
      setFormData({
        meetingName: '',
        meetingId: '',
        date: '',
        time: '',
        duration: 60,
        password: '',
        description: '',
        participants: []
      });
    } catch (error) {
      toast.error('Failed to schedule meeting');
    }
  };

  const handleDeleteSchedule = (id) => {
    const updated = scheduledMeetings.filter(m => m.id !== id);
    saveScheduledMeetings(updated);
    toast.success('Meeting deleted');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const hasMeetingOnDate = (date) => {
    return scheduledMeetings.some(m => m.date === date.toISOString().split('T')[0]);
  };

  const getMeetingsForDate = (date) => {
    return scheduledMeetings.filter(m => m.date === date.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Meeting Scheduler</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Schedule Meeting
          </button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Schedule New Meeting</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Name *</label>
                <input
                  type="text"
                  value={formData.meetingName}
                  onChange={(e) => setFormData({...formData, meetingName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="Team Meeting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meeting ID (Optional)</label>
                <input
                  type="text"
                  value={formData.meetingId}
                  onChange={(e) => setFormData({...formData, meetingId: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  placeholder="Leave blank for auto-generate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password (Optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                  rows="3"
                  placeholder="Meeting description..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateSchedule}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Calendar View */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-700 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-700 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm text-gray-400 py-2">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-lg border ${
                    date ? (hasMeetingOnDate(date) ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700')
                    : 'border-transparent'
                  }`}
                >
                  {date && (
                    <>
                      <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                      {getMeetingsForDate(date).map(meeting => (
                        <div key={meeting.id} className="text-xs bg-blue-600 rounded p-1 mb-1 truncate">
                          {meeting.meetingName}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Upcoming Meetings List */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
            <div className="space-y-3">
              {scheduledMeetings
                .filter(m => new Date(m.datetime) > new Date())
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                .map(meeting => (
                  <div key={meeting.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{meeting.meetingName}</h3>
                        <div className="text-sm text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {meeting.date}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {meeting.time} ({meeting.duration} min)
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Video className="w-3 h-3" />
                            ID: {meeting.meetingId}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(meeting.id)}
                        className="p-1 hover:bg-red-600 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {scheduledMeetings.filter(m => new Date(m.datetime) > new Date()).length === 0 && (
                <p className="text-gray-400 text-center">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;