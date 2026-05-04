-- Campus Event Management Database System
-- Final project schema draft (normalized relational design)

CREATE TABLE Organizers (
    OrganizerID INT PRIMARY KEY AUTO_INCREMENT,
    OrganizerName VARCHAR(100) NOT NULL,
    OrganizerType VARCHAR(50) NOT NULL,
    Email VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE Venues (
    VenueID INT PRIMARY KEY AUTO_INCREMENT,
    VenueName VARCHAR(100) NOT NULL,
    Building VARCHAR(100) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0)
);

CREATE TABLE Events (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    OrganizerID INT NOT NULL,
    VenueID INT NOT NULL,
    Title VARCHAR(150) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    EventDate DATE NOT NULL,
    EventTime TIME NOT NULL,
    Description TEXT,
    MaxCapacity INT NOT NULL CHECK (MaxCapacity > 0),
    Status VARCHAR(30) DEFAULT 'Scheduled',
    FOREIGN KEY (OrganizerID) REFERENCES Organizers(OrganizerID),
    FOREIGN KEY (VenueID) REFERENCES Venues(VenueID)
);

CREATE TABLE Attendees (
    AttendeeID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL UNIQUE,
    Major VARCHAR(100)
);

CREATE TABLE Registrations (
    RegistrationID INT PRIMARY KEY AUTO_INCREMENT,
    EventID INT NOT NULL,
    AttendeeID INT NOT NULL,
    RegistrationStatus VARCHAR(30) DEFAULT 'Registered',
    RegisteredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (AttendeeID) REFERENCES Attendees(AttendeeID),
    UNIQUE (EventID, AttendeeID)
);

CREATE INDEX idx_events_date ON Events(EventDate);
CREATE INDEX idx_registrations_event ON Registrations(EventID);
