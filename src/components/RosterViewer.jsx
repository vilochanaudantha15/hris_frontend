import React, { useState, useEffect } from 'react';
import AppTheme from '../shared-theme/AppTheme';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import '../scss/roster.scss';

const RosterTable = (props) => {
  const [powerPlants, setPowerPlants] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [roster, setRoster] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [holidaysError, setHolidaysError] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shifts = ['Morning ', 'Day ', 'Night '];

  const CALENDARIFIC_API_KEY = 'l5y646Kv9qQGI9mvtsL1Xso8z8OLtmiH';

  // Infer holiday type based on name
  const getHolidayType = (name) => {
    if (!name) return 'Public Holiday';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('poya')) return 'Poya Day';
    if (lowerName.includes('eid') || lowerName.includes('vesak') || lowerName.includes('sivarathri') || lowerName.includes('milad') || lowerName.includes('deepavali') || lowerName.includes('good friday')) return 'Religious Holiday';
    if (lowerName.includes('new year') || lowerName.includes('independence') || lowerName.includes('labour')) return 'National Holiday';
    return 'Public Holiday';
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const plantsResponse = await fetch('http://localhost:4000/api/power-plants');
        if (!plantsResponse.ok) throw new Error(`Failed to fetch power plants: ${await plantsResponse.text()}`);
        const plants = await plantsResponse.json();
        setPowerPlants(plants);
        if (plants.length > 0) setSelectedPlant(plants[0]);

        const supervisorsResponse = await fetch('http://localhost:4000/api/supervisors');
        if (!supervisorsResponse.ok) throw new Error(`Failed to fetch supervisors: ${await supervisorsResponse.text()}`);
        const supervisorsData = await supervisorsResponse.json();

        const laborersResponse = await fetch('http://localhost:4000/api/laborers');
        if (!laborersResponse.ok) throw new Error(`Failed to fetch laborers: ${await laborersResponse.text()}`);
        const laborersData = await laborersResponse.json();

        const allEmployees = [
          ...supervisorsData.map(emp => ({ ...emp, role: 'supervisor' })),
          ...laborersData.map(emp => ({ ...emp, role: 'laborer' }))
        ];
        setEmployees(allEmployees);

        if (plants.length > 0) {
          await fetchRoster(plants[0], selectedYear, month);
        }
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      setHolidaysError(null);
      try {
        const response = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=LK&year=${selectedYear}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch holidays: ${errorText}`);
        }
        const data = await response.json();
        if (data.meta.code !== 200) {
          throw new Error(`API error: ${data.meta.error_detail || 'Unknown error'}`);
        }
        const holidaysList = data.response.holidays.map(holiday => ({
          date: holiday.date.iso.split('T')[0],
          name: holiday.name,
          type: getHolidayType(holiday.name)
        }));
        setHolidays(holidaysList);
        console.log('Fetched holidays:', holidaysList);
      } catch (err) {
        setHolidaysError(`Failed to load holidays: ${err.message}. Continuing without holiday markings.`);
        setHolidays([]);
        console.error('Holidays fetch error:', err);
      }
    };

    fetchHolidays();
  }, [selectedYear]);

  useEffect(() => {
    if (selectedPlant) {
      fetchRoster(selectedPlant, selectedYear, month);
    }
  }, [selectedPlant, selectedYear, month]);

  const fetchRoster = async (plant, year, month) => {
    try {
      const response = await fetch(`http://localhost:4000/api/roster?plant=${plant}&year=${year}&month=${month}`);
      if (!response.ok) throw new Error(`Failed to fetch roster: ${await response.text()}`);
      const rosterData = await response.json();
      const formattedRoster = {};
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        formattedRoster[plant] = formattedRoster[plant] || {};
        formattedRoster[plant][dateKey] = formattedRoster[plant][dateKey] || {};
        shifts.forEach((_, index) => {
          formattedRoster[plant][dateKey][index] = formattedRoster[plant][dateKey][index] || { supervisor: null, laborers: [] };
        });
      }
      rosterData.forEach(({ date, shift, supervisor, laborers }) => {
        const shiftIndex = shifts.indexOf(shift);
        if (shiftIndex !== -1) {
          const [year, monthStr, day] = date.split('-');
          const dateKey = `${year}-${monthStr.padStart(2, '0')}-${day.padStart(2, '0')}`;
          formattedRoster[plant][dateKey][shiftIndex] = {
            supervisor: supervisor || null,
            laborers: laborers || []
          };
        }
      });
      setRoster(formattedRoster);
    } catch (err) {
      setError(err.message);
      console.error('Roster fetch error:', err);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isHoliday = (year, month, day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(holiday => holiday.date === dateKey);
  };

  const handleShiftAssignment = (day, shiftIndex, employeeId, isSupervisor) => {
    const dateKey = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const holiday = isHoliday(selectedYear, month, day);
    if (holiday) {
      alert(`Cannot assign shifts on ${dateKey} (${holiday.name} - ${holiday.type}) as it is a holiday.`);
      return;
    }
    setRoster(prevRoster => {
      const newRoster = JSON.parse(JSON.stringify(prevRoster));
      newRoster[selectedPlant] = newRoster[selectedPlant] || {};
      newRoster[selectedPlant][dateKey] = newRoster[selectedPlant][dateKey] || {};
      newRoster[selectedPlant][dateKey][shiftIndex] = newRoster[selectedPlant][dateKey][shiftIndex] || { supervisor: null, laborers: [] };

      const currentShiftData = newRoster[selectedPlant][dateKey][shiftIndex];

      if (isSupervisor) {
        newRoster[selectedPlant][dateKey][shiftIndex] = {
          supervisor: currentShiftData.supervisor === employeeId ? null : employeeId,
          laborers: currentShiftData.supervisor === employeeId ? [] : currentShiftData.laborers
        };
      } else {
        newRoster[selectedPlant][dateKey][shiftIndex] = {
          ...currentShiftData,
          laborers: currentShiftData.laborers.includes(employeeId)
            ? currentShiftData.laborers.filter(id => id !== employeeId)
            : [...currentShiftData.laborers, employeeId]
        };
      }

      return newRoster;
    });
  };

  const handleSaveToDatabase = async () => {
    console.log('Save button clicked');
    setIsLoading(true);
    setError(null);
    try {
      const datesWithData = Object.keys(roster[selectedPlant] || {}).filter(dateKey =>
        Object.values(roster[selectedPlant][dateKey] || {}).some(
          shift => shift.supervisor || (shift.laborers && shift.laborers.length > 0)
        )
      );

      if (datesWithData.length === 0) {
        throw new Error('No roster data to save');
      }

      for (const dateKey of datesWithData) {
        const holiday = holidays.find(h => h.date === dateKey);
        if (holiday) {
          throw new Error(`Cannot save roster for ${dateKey} (${holiday.name} - ${holiday.type}) as it is a holiday.`);
        }
        const shiftData = roster[selectedPlant][dateKey] || {};
        for (const [index, shift] of shifts.entries()) {
          const shiftInfo = shiftData[index] || { supervisor: null, laborers: [] };
          if (shiftInfo.supervisor || shiftInfo.laborers.length > 0) {
            console.log(`Before save - date=${dateKey}, index=${index}, shift=${shift}, supervisorId=${shiftInfo.supervisor}, laborerIds=${shiftInfo.laborers}`);
            const response = await fetch('http://localhost:4000/api/roster', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                plant: selectedPlant,
                date: dateKey,
                shift: shift,
                supervisorId: shiftInfo.supervisor || null,
                laborerIds: shiftInfo.laborers || []
              })
            });
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Fetch error for ${dateKey}, ${shift}: ${errorText}`);
              throw new Error(`Failed to save roster for ${dateKey}, ${shift}: ${errorText}`);
            }
          }
        }
      }

      alert('Roster saved successfully to database!');
    } catch (err) {
      setError(err.message);
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRosterTable = () => {
    if (isLoading) return <Typography className="loading" color="text.primary">Loading...</Typography>;
    if (error) return <Typography className="error" color="error.main">Error: {error}</Typography>;
    if (holidaysError) {
      return (
        <Box>
          <Typography className="error" color="warning.main" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.2rem' }}>
            Warning: {holidaysError}
          </Typography>
          {renderTable()}
        </Box>
      );
    }

    return renderTable();
  };

  const renderTable = () => {
    const daysInMonth = getDaysInMonth(selectedYear, month);
    const firstDay = getFirstDayOfMonth(selectedYear, month);

    return (
      <Box className="roster-table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Employee</th>
              {[...Array(daysInMonth).keys()].map(day => {
                const dateKey = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                const holiday = isHoliday(selectedYear, month, day + 1);
                return (
                  <th
                    key={day}
                    className={`day-header ${daysOfWeek[(firstDay + day) % 7].toLowerCase()} ${holiday ? 'holiday' : ''}`}
                    title={holiday ? `${holiday.name} (${holiday.type})` : ''}
                  >
                    {day + 1}<br />
                    {daysOfWeek[(firstDay + day) % 7]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id} className={`employee-row ${employee.role === 'supervisor' ? `color-${index % 5}` : ''}`}>
                <td className={employee.role === 'supervisor' ? 'supervisor-name' : ''}>{employee.name}</td>
                {[...Array(daysInMonth).keys()].map(day => {
                  const dateKey = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                  const holiday = isHoliday(selectedYear, month, day + 1);
                  return (
                    <td key={day} className={`shift-cell ${holiday ? 'holiday' : ''}`}>
                      <Box className="shift-checkbox-row">
                        {shifts.map((shift, shiftIndex) => {
                          const shiftData = roster[selectedPlant]?.[dateKey]?.[shiftIndex] || { supervisor: null, laborers: [] };
                          const isAssigned = employee.role === 'supervisor'
                            ? shiftData.supervisor === employee.id
                            : shiftData.laborers.includes(employee.id);
                          return (
                            <Box key={`${day}-${shiftIndex}`} className="shift-checkbox">
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={() => handleShiftAssignment(day + 1, shiftIndex, employee.id, employee.role === 'supervisor')}
                                disabled={holiday}
                              />
                              <Typography component="span">{shift}</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          p: { xs: 2, sm: 4 },
        }}
      >
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Box className="roster-container">
          <Box className="roster-header">
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Monthly Roster - {months[month]} {selectedYear}
            </Typography>
            <Box className="roster-controls">
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              >
                {powerPlants.map(plant => (
                  <option key={plant} value={plant}>{plant}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                disabled={isLoading}
                style={{ backgroundColor: 'background.paper', color: 'text.primary' }}
              />
              <button
                onClick={handleSaveToDatabase}
                disabled={isLoading || !selectedPlant || Object.keys(roster[selectedPlant] || {}).length === 0}
                style={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}
              >
                Save Roster
              </button>
            </Box>
          </Box>
          {renderRosterTable()}
        </Box>
      </Box>
    </AppTheme>
  );
};

export default RosterTable;