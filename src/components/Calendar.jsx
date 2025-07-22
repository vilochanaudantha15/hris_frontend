import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../scss/Calendar.scss';

const HolidayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '', type: 'Poya' });
  const [error, setError] = useState('');

  // Fetch holidays from backend
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get('http://localhost:4000/holidays/holidays');
        setHolidays(response.data);
      } catch (err) {
        console.error('Error fetching holidays:', err);
        setError('Failed to load holidays');
      }
    };
    fetchHolidays();
  }, []);

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Handle navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle form submission
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/holidays/holidays', newHoliday);
      const response = await axios.get('http://localhost:4000/holidays/holidays');
      setHolidays(response.data);
      setShowModal(false);
      setNewHoliday({ date: '', name: '', type: 'Poya' });
      setError('');
    } catch (err) {
      console.error('Error adding holiday:', err);
      setError(err.response?.data?.error || 'Failed to add holiday');
    }
  };

  // Check if a date is a holiday
  const isHoliday = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return holidays.find(h => h.date === dateStr);
  };

  return (
    <div className="holiday-calendar">
      <h1 className="calendar-title">Holiday Calendar</h1>
      
      {/* Navigation and Add Holiday Button */}
      <div className="calendar-controls">
        <div>
          <button onClick={prevMonth} className="nav-button prev-button">
            Previous
          </button>
          <button onClick={nextMonth} className="nav-button next-button">
            Next
          </button>
        </div>
        <span className="current-month">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="add-button"
        >
          Add Holiday
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        {getDaysInMonth().map((day, index) => {
          const holiday = day ? isHoliday(day) : null;
          return (
            <div
              key={index}
              className={`day-cell ${
                day
                  ? holiday
                    ? holiday.type === 'Poya'
                      ? 'poya-day'
                      : holiday.type === 'Public'
                      ? 'public-day'
                      : 'custom-day'
                    : 'regular-day'
                  : 'empty-day'
              }`}
            >
              {day && (
                <>
                  <div className="day-number">{day.getDate()}</div>
                  {holiday && (
                    <div className="holiday-info">
                      {holiday.name} ({holiday.type})
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Holiday Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Add New Holiday</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddHoliday}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="form-input"
                >
                  <option value="Poya">Poya</option>
                  <option value="Public">Public</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolidayCalendar;