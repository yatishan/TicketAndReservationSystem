import React, { useEffect, useState } from 'react';
import API from '../services/api';

const EventList = ({ onSelectEvent }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/events')
            .then(response => {
                if (response.data.success) {
                    setEvents(response.data.data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4 text-center fw-bold text-uppercase text-primary">အနုပညာပွဲလမ်းသဘင်များ</h2>
            <div className="row">
                {events.map(event => (
                    <div className="col-md-6 col-lg-4 mb-4" key={event.id}>
                        <div className="card h-100 shadow-sm border-0 bg-light">
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title fw-bold text-dark">{event.title}</h5>
                                <p className="card-text text-muted small flex-grow-1">
                                    {event.description}
                                </p>
                                <div className="mb-3 small">
                                    <div className="text-secondary mb-1">
                                        <i className="bi bi-geo-alt-fill text-danger me-2"></i>{event.location}
                                    </div>
                                    <div className="text-secondary">
                                        <i className="bi bi-calendar-event-fill text-primary me-2"></i>
                                        {new Date(event.start_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary w-100 fw-bold"
                                    onClick={() => onSelectEvent(event.id)}
                                >
                                    ခုံနေရာရွေးချယ်မည် <i className="bi bi-arrow-right-short"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;