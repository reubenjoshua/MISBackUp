CREATE DATABASE MIS
USE MIS
GO

CREATE TABLE Role (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	roleName varchar(64),
	description varchar(256)
);

	INSERT INTO Role (roleName, description)
		VALUES 
			('Super Admin', 'has access to everything'),
			('Central Admin', 'has access to everything'),
			('Branch Admin', 'specific to branch'),
			('Encoder', 'Encoder'); 

	SELECT * FROM Role

CREATE TABLE Area (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	areaCode INT NOT NULL,
	areaName varchar(64),
	isActive BIT
);

	INSERT INTO Area (areaCode, areaName, isActive)
		VALUES 
			(1, 'Vista', 1),
			(2, 'JV', 1),
			(3, 'FPR', 1); 
	
	USE MISDb
	GO
	SELECT * FROM Area

CREATE TABLE Branch (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	areaId INT,
	branchCode INT,
	branchName varchar(64),
	isActive BIT,
	FOREIGN KEY (areaid) REFERENCES Area(id)
);

	INSERT INTO Branch (areaId, branchCode, branchName, isActive)
		VALUES 
		    (1, 101, 'Batangas', 1),
		    (2, 102, 'Lipa', 1),
		    (3, 103, 'Taguig', 1); 
	
	USE MISDb
	GO
	SELECT * FROM Branch

CREATE TABLE [User] (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	roleId INT,
	areaId INT,
	branchId INT,
	monthlyEncoded INT,
	dailyEncoded INT,
	userName varchar(64),
	firstName varchar(64),
	lastName varchar(64),
	email varchar(64),
	passwordHash varchar(64),
	isActive BIT,
	FOREIGN KEY (roleId) REFERENCES Role(id),
	FOREIGN KEY (areaId) REFERENCES Area(id),
	FOREIGN KEY (branchId) REFERENCES Branch(id)
);

	ALTER TABLE [User]
		ADD CONSTRAINT FK_User_monthlyEncoded
		FOREIGN KEY (monthlyEncoded) REFERENCES Monthly(id)

	ALTER TABLE [User]
		ADD CONSTRAINT FK_User_dailyEncoded
		FOREIGN KEY (dailyEncoded) REFERENCES daily(id)

	INSERT INTO [User] (roleId, areaId, branchId, monthlyEncoded, dailyEncoded, userName, firstName, lastName, email, passwordHash, isActive)
		VALUES 
			(1, NULL, NULL, NULL, NULL, 'superadmin', 'Super', 'Admin', 'superadmin@example.com', 'hashed_password_here', 1);

	SELECT * FROM [User]

CREATE TABLE Monthly (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	branchId INT,
	sourceType INT,
	sourceName INT,
	status INT,
	byUser INT,
	month varchar(32),
	year INT,
	electricityConsumption FLOAT,
	electricityCost FLOAT,
	bulkCost FLOAT,
	bulkOuttake FLOAT,
	bulkProvider FLOAT,
	WTPCost FLOAT,
	WTPSource FLOAT,
	WTPVolume FLOAT,
	disinfectionMode varchar(128),
	disinfectantCost FLOAT,
	disinfectionAmount FLOAT,
	disinfectionBrandType varchar(128),
	otherTreatmentCost FLOAT,
	emergencyLitersConsumed FLOAT,
	emergencyFuelCost FLOAT,
	emergencyTotalHoursUsed FLOAT,
	gensetLitersConsumed FLOAT,
	gensetFuelCost FLOAT,
	isActive BIT,
	comment varchar(1024)
	FOREIGN KEY (branchId) REFERENCES Branch(id)
);

	INSERT INTO Monthly (
		branchId, sourceType, sourceName, status, byUser, month, year,
		electricityConsumption, electricityCost, bulkCost, bulkOuttake, bulkProvider,
		WTPCost, WTPSource, WTPVolume, disinfectionMode, disinfectantCost,
		disinfectionAmount, disinfectionBrandType, otherTreatmentCost,
		emergencyLitersConsumed, emergencyFuelCost, emergencyTotalHoursUsed,
		gensetLitersConsumed, gensetFuelCost, isActive, comment)
		VALUES 
			-- Batangas Branch (ID: 1)
			(1, 1, 1, 1, 1, 'January', 2024,
			1500.50, 15000.75, 5000.00, 1000.00, 1,
			2000.00, 1, 500.00, 'Chlorine', 1000.00,
			50.00, 'Chlorine Brand A', 500.00,
			100.00, 5000.00, 24.00,
			200.00, 10000.00, 1, 'Regular monthly operations'),
			
			-- Lipa Branch (ID: 2)
			(2, 1, 1, 1, 1, 'January', 2024,
			1200.25, 12000.50, 4500.00, 900.00, 1,
			1800.00, 1, 450.00, 'Chlorine', 900.00,
			45.00, 'Chlorine Brand A', 450.00,
			80.00, 4000.00, 20.00,
			180.00, 9000.00, 1, 'Regular monthly operations'),
			
			-- Taguig Branch (ID: 3)
			(3, 1, 1, 1, 1, 'January', 2024,
			1800.75, 18000.25, 6000.00, 1200.00, 1,
			2500.00, 1, 600.00, 'Chlorine', 1200.00,
			60.00, 'Chlorine Brand A', 600.00,
			120.00, 6000.00, 30.00,
			250.00, 12500.00, 1, 'Regular monthly operations');

CREATE TABLE sourceType (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	branchId INT,
	sourceType varchar(64),
	isActive BIT
	FOREIGN KEY (branchId) REFERENCES Branch(id)
);

	ALTER TABLE Monthly
		ADD CONSTRAINT FK_Monthly_sourceType
		FOREIGN KEY (sourceType) REFERENCES sourceType(id)

	INSERT INTO sourceType (branchId, sourceType, isActive)
		VALUES 
			-- Batangas Branch (ID: 1)
			(1, 'Deep Well - Electric', 1),
			(1, 'Deep Well - Genset Operated', 1),
			(1, 'Shallow Well', 1),
			(1, 'Spring - Gravity', 1),
			(1, 'Spring - Power-driven', 1),
			(1, 'Bulk', 1),
			(1, 'WTP', 1),
			(1, 'Booster', 1),
			
			-- Lipa Branch (ID: 2)
			(2, 'Deep Well - Electric', 1),
			(2, 'Deep Well - Genset Operated', 1),
			(2, 'Shallow Well', 1),
			(2, 'Spring - Gravity', 1),
			(2, 'Spring - Power-driven', 1),
			(2, 'Bulk', 1),
			(2, 'WTP', 1),
			(2, 'Booster', 1),
			
			-- Taguig Branch (ID: 3)
			(3, 'Deep Well - Electric', 1),
			(3, 'Deep Well - Genset Operated', 1),
			(3, 'Shallow Well', 1),
			(3, 'Spring - Gravity', 1),
			(3, 'Spring - Power-driven', 1),
			(3, 'Bulk', 1),
			(3, 'WTP', 1),
			(3, 'Booster', 1);

	USE MISDb
	GO
	SELECT * FROM sourceType

CREATE TABLE sourceName (
	id INT IDENTITY (1, 1) NOT NULL PRIMARY KEY,
	branchId INT,
	sourceTypeId INT,
	sourceName varchar(64),
	isActive BIT,
	FOREIGN KEY (branchId) REFERENCES Branch(id),
	FOREIGN KEY (sourceTypeId) REFERENCES sourceType(id)
);

	USE MISDb
	GO
	SELECT * FROM sourceName

	INSERT INTO sourceName (branchId, sourceTypeId, sourceName, isActive)
		VALUES 
			-- Batangas Branch (ID: 1)
			(1, 1, 'P1', 1),
			(1, 1, 'P2', 1),
			(1, 1, 'P3', 1),
			(1, 2, 'P1', 1),
			(1, 2, 'P2', 1),
			(1, 2, 'P3', 1),
			(1, 3, 'P1', 1),
			(1, 3, 'P2', 1),
			(1, 3, 'P3', 1),
			(1, 4, 'P1', 1),
			(1, 4, 'P2', 1),
			(1, 4, 'P3', 1),
			(1, 5, 'P1', 1),
			(1, 5, 'P2', 1),
			(1, 5, 'P3', 1),
			(1, 6, 'P1', 1),
			(1, 6, 'P2', 1),
			(1, 6, 'P3', 1),
			(1, 7, 'P1', 1),
			(1, 7, 'P2', 1),
			(1, 7, 'P3', 1),
			(1, 8, 'P1', 1),
			(1, 8, 'P2', 1),
			(1, 8, 'P3', 1),
			
			-- Lipa Branch (ID: 2)
			(2, 9, 'P1', 1),
			(2, 9, 'P2', 1),
			(2, 9, 'P3', 1),
			(2, 10, 'P1', 1),
			(2, 10, 'P2', 1),
			(2, 10, 'P3', 1),
			(2, 11, 'P1', 1),
			(2, 11, 'P2', 1),
			(2, 11, 'P3', 1),
			(2, 12, 'P1', 1),
			(2, 12, 'P2', 1),
			(2, 12, 'P3', 1),
			(2, 13, 'P1', 1),
			(2, 13, 'P2', 1),
			(2, 13, 'P3', 1),
			(2, 14, 'P1', 1),
			(2, 14, 'P2', 1),
			(2, 14, 'P3', 1),
			(2, 15, 'P1', 1),
			(2, 15, 'P2', 1),
			(2, 15, 'P3', 1),
			(2, 16, 'P1', 1),
			(2, 16, 'P2', 1),
			(2, 16, 'P3', 1),
			
			-- Taguig Branch (ID: 3)
			(3, 17, 'P1', 1),
			(3, 17, 'P2', 1),
			(3, 17, 'P3', 1),
			(3, 18, 'P1', 1),
			(3, 18, 'P2', 1),
			(3, 18, 'P3', 1),
			(3, 19, 'P1', 1),
			(3, 19, 'P2', 1),
			(3, 19, 'P3', 1),
			(3, 20, 'P1', 1),
			(3, 20, 'P2', 1),
			(3, 20, 'P3', 1),
			(3, 21, 'P1', 1),
			(3, 21, 'P2', 1),
			(3, 21, 'P3', 1),
			(3, 22, 'P1', 1),
			(3, 22, 'P2', 1),
			(3, 22, 'P3', 1),
			(3, 23, 'P1', 1),
			(3, 23, 'P2', 1),
			(3, 23, 'P3', 1),
			(3, 24, 'P1', 1),
			(3, 24, 'P2', 1),
			(3, 24, 'P3', 1);

	SELECT * FROM sourceName

CREATE TABLE Status(
	id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
	statusName varchar(16)
);

	ALTER TABLE Monthly
		ADD CONSTRAINT FK_Monthly_status
		FOREIGN KEY (status) REFERENCES status(id)

	INSERT INTO Status (statusName)
		VALUES 
			('Accepted'),
			('Pending'),
			('Rejected');

CREATE TABLE Daily (
	id INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
	monthlyId INT,
	sourceType INT,
	sourceName INT,
	status INT,
	byUser INT,
	date date,
	productionVolume FLOAT,
	operationHours FLOAT,
	serviceInterruption FLOAT,
	totalHoursServiceInterruption FLOAT,
	electricityConsumption FLOAT,
	VFDFrequency FLOAT,
	spotFlow FLOAT,
	spotPressure FLOAT,
	timeSpotMeasurements FLOAT,
	lineVoltage1 FLOAT,
	lineVoltage2 FLOAT,
	lineVoltage3 FLOAT,
	lineCurrent1 FLOAT,
	lineCurrent2 FLOAT,
	lineCurrent3 FLOAT,
	comment varchar (1024),
	isActive BIT,
	FOREIGN KEY (monthlyId) REFERENCES Monthly(id),
	FOREIGN KEY (sourceType) REFERENCES sourceType(id),
	FOREIGN KEY (sourceName) REFERENCES sourceName(id),
	FOREIGN KEY (status) REFERENCES status(id),
	FOREIGN KEY (byUser) REFERENCES [User](id)
);

	INSERT INTO Daily (
		monthlyId, sourceType, sourceName, status, byUser, date,
		productionVolume, operationHours, serviceInterruption, totalHoursServiceInterruption,
		electricityConsumption, VFDFrequency, spotFlow, spotPressure, timeSpotMeasurements,
		lineVoltage1, lineVoltage2, lineVoltage3,
		lineCurrent1, lineCurrent2, lineCurrent3,
		comment, isActive)
		VALUES 
			-- Batangas Branch Daily Records
			(NULL, 1, 1, 1, 1, '2024-01-01',
			500.00, 24.00, 0.00, 0.00,
			50.00, 60.00, 100.00, 50.00, 8.00,
			220.00, 220.00, 220.00,
			10.00, 10.00, 10.00,
			'Normal operations', 1),
			
			(NULL, 1, 1, 1, 1, '2024-01-02',
			480.00, 23.50, 0.50, 0.50,
			48.00, 60.00, 98.00, 48.00, 8.00,
			218.00, 220.00, 222.00,
			9.80, 10.00, 10.20,
			'Minor power fluctuation', 1),
			
			-- Lipa Branch Daily Records
			(NULL, 9, 25, 1, 1, '2024-01-01',
			450.00, 24.00, 0.00, 0.00,
			45.00, 60.00, 95.00, 45.00, 8.00,
			220.00, 220.00, 220.00,
			9.50, 9.50, 9.50,
			'Normal operations', 1),
			
			(NULL, 9, 25, 1, 1, '2024-01-02',
			430.00, 23.00, 1.00, 1.00,
			43.00, 60.00, 93.00, 43.00, 8.00,
			219.00, 220.00, 221.00,
			9.30, 9.40, 9.50,
			'Scheduled maintenance', 1),
			
			-- Taguig Branch Daily Records
			(NULL, 17, 49, 1, 1, '2024-01-01',
			600.00, 24.00, 0.00, 0.00,
			60.00, 60.00, 120.00, 60.00, 8.00,
			220.00, 220.00, 220.00,
			12.00, 12.00, 12.00,
			'Normal operations', 1),
			
			(NULL, 17, 49, 1, 1, '2024-01-02',
			580.00, 23.00, 1.00, 1.00,
			58.00, 60.00, 118.00, 58.00, 8.00,
			219.00, 220.00, 221.00,
			11.80, 11.90, 12.00,
			'Routine maintenance', 1);

	SELECT * FROM Daily

CREATE TABLE branchSource (
	id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	branchId INT,
	sourceTypeId INT,
	FOREIGN KEY (branchId) REFERENCES Branch(id),
	FOREIGN KEY (sourceTypeId) REFERENCES sourceType(id)
);

	SELECT * FROM branchSource
	
	ALTER TABLE branchSource
		ADD isActive BIT

	ALTER TABLE branchSource
		ADD areaId INT

	ALTER TABLE branchSource
		ADD CONSTRAINT FK_branchSource_area FOREIGN KEY (areaId) REFERENCES Area(id)

CREATE TABLE branchSourceName (
	id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	branchId INT,
	sourceNameId INT,
	FOREIGN KEY (branchId) REFERENCES Branch(id),
	FOREIGN KEY (sourceNameId) REFERENCES sourceName(id)
);

	SELECT * FROM branchSourceName

	ALTER TABLE branchSourceName
		ADD isActive BIT

	ALTER TABLE branchSourceName
		ADD areaId INT

	ALTER TABLE branchSourceName
		ADD CONSTRAINT FK_branchSourceName_area FOREIGN KEY (areaId) REFERENCES Area(id)

	DELETE FROM Daily
		DBCC CHECKIDENT ('Daily', RESEED, 0)
	DELETE FROM sourceName;
		DBCC CHECKIDENT ('sourceName', RESEED, 0)
	DELETE FROM sourceType;
		DBCC CHECKIDENT ('sourceType', RESEED, 0)

	INSERT INTO sourceType (sourceType, isActive) 
		VALUES
			('Deep Well - Electric', 1),
			('Deep Well - Genset Operated', 1),
			('Shallow Well', 1),
			('Spring - Gravity', 1),
			('Spring - Power-driven', 1),
			('Bulk', 1),
			('WTP', 1),
			('Booster', 1);

	UPDATE branchSource
		SET areaId = b.areaId
		FROM branchSource bs
		JOIN Branch b ON bs.branchId = b.id
		WHERE bs.areaId IS NULL;

    SELECT id, areaId FROM Branch WHERE id IN (34, 35, 36);

	ALTER TABLE branchSourceName 
		ALTER COLUMN areaId INT NOT NULL;

	SELECT bsn.*
		FROM branchSourceName bsn
		LEFT JOIN Branch b ON bsn.branchId = b.id
		WHERE b.id IS NULL;

	DELETE bsn
		FROM branchSourceName bsn
		LEFT JOIN Branch b ON bsn.branchId = b.id
		WHERE b.id IS NULL;

	UPDATE branchSourceName
		SET areaId = (
			SELECT areaId FROM Branch WHERE Branch.id = branchSourceName.branchId
		)
		WHERE areaId IS NULL;

SELECT TOP (1000) [id]
      ,[monthlyId]
      ,[sourceType]
      ,[sourceName]
      ,[status]
      ,[byUser]
      ,[date]
      ,[productionVolume]
      ,[operationHours]
      ,[serviceInterruption]
      ,[totalHoursServiceInterruption]
      ,[electricityConsumption]
      ,[VFDFrequency]
      ,[spotFlow]
      ,[spotPressure]
      ,[timeSpotMeasurements]
      ,[lineVoltage1]
      ,[lineVoltage2]
      ,[lineVoltage3]
      ,[lineCurrent1]
      ,[lineCurrent2]
      ,[lineCurrent3]
      ,[comment]
      ,[isActive]
  FROM [MISDb].[dbo].[Daily]
 
 
 ALTER TABLE Daily
 ADD branchId INT,
     areaId INT


ALTER TABLE Daily
ADD CONSTRAINT FK_Daily_Branch
	FOREIGN KEY (branchId) REFERENCES Branch(id)

ALTER TABLE Daily
ADD CONSTRAINT FK_Daily_Area
	FOREIGN KEY (areaId) REFERENCES Area(id)
