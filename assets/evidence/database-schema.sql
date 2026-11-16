-- Extracted from INFO 2312 coursework, Lab 3.
-- Only formatting and removal of identifying header/comment details were applied.
-- The source document does not declare a DBMS.
-- This standalone lab is separate from the Moodle group database project.

CREATE TABLE Customer (
    SSN VARCHAR(20) PRIMARY KEY,
    Name VARCHAR(100)
);

CREATE TABLE Phone (
    Phone VARCHAR(20) PRIMARY KEY,
    SSN VARCHAR(20),
    FOREIGN KEY (SSN)
        REFERENCES Customer(SSN)
);

CREATE TABLE Property (
    PNumber INT PRIMARY KEY,
    City VARCHAR(50),
    Street VARCHAR(100),
    PostalCode VARCHAR(20)
);

CREATE TABLE Land (
    PNumber INT PRIMARY KEY,
    AccessRoad VARCHAR(100),
    FOREIGN KEY (PNumber)
        REFERENCES Property(PNumber)
);

CREATE TABLE House (
    PNumber INT PRIMARY KEY,
    RoomNum INT,
    FOREIGN KEY (PNumber)
        REFERENCES Property(PNumber)
);

CREATE TABLE Bill (
    BID INT PRIMARY KEY,
    IssueDate DATE,
    TotalPrice DECIMAL(12,2)
);

CREATE TABLE Payment (
    BID INT,
    Number INT,
    DueDate DATE,
    Amount DECIMAL(12,2),

    PRIMARY KEY (BID, Number),

    FOREIGN KEY (BID)
        REFERENCES Bill(BID)
);

CREATE TABLE Buy (
    CustomerSSN VARCHAR(20),
    PropertyNum INT,
    BillID INT,

    PRIMARY KEY (CustomerSSN, PropertyNum, BillID),

    FOREIGN KEY (CustomerSSN)
        REFERENCES Customer(SSN),

    FOREIGN KEY (PropertyNum)
        REFERENCES Property(PNumber),

    FOREIGN KEY (BillID)
        REFERENCES Bill(BID)
);

CREATE TABLE Sell (
    CustomerSSN VARCHAR(20),
    PropertyNum INT,
    RequestedPrice DECIMAL(12,2),

    PRIMARY KEY (CustomerSSN, PropertyNum),

    FOREIGN KEY (CustomerSSN)
        REFERENCES Customer(SSN),

    FOREIGN KEY (PropertyNum)
        REFERENCES Property(PNumber)
);
