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
