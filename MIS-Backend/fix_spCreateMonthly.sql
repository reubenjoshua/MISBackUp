USE [MISDb]
GO

-- Drop the existing stored procedure
DROP PROCEDURE [dbo].[spCreateMonthly]
GO

-- Recreate the stored procedure with correct parameter types
CREATE PROCEDURE [dbo].[spCreateMonthly]
    @branchId INT,
    @sourceType INT = NULL,
    @sourceName INT = NULL,
    @status INT = 2,
    @byUser INT,
    @month INT,
    @year INT,
    @productionVolume FLOAT = 0,
    @operationHours FLOAT = 0,
    @serviceInterruption FLOAT = 0,
    @totalHoursServiceInterruption FLOAT = 0,
    @electricityConsumption FLOAT = 0,
    @electricityCost FLOAT = 0,
    @bulkCost FLOAT = 0,
    @bulkOuttake NVARCHAR(255) = NULL,
    @bulkProvider NVARCHAR(255) = NULL,
    @WTPCost FLOAT = 0,
    @WTPSource NVARCHAR(255) = NULL,
    @WTPVolume FLOAT = 0,
    @disinfectionMode NVARCHAR(255) = NULL,
    @disinfectantCost FLOAT = 0,
    @disinfectionAmount FLOAT = 0,
    @disinfectionBrandType NVARCHAR(255) = NULL,
    @otherTreatmentCost FLOAT = 0,
    @emergencyLitersConsumed FLOAT = 0,
    @emergencyFuelCost FLOAT = 0,
    @emergencyTotalHoursUsed FLOAT = 0,
    @gensetLitersConsumed FLOAT = 0,
    @gensetFuelCost FLOAT = 0,
    @isActive BIT = 1,
    @comment NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Monthly (
        branchId, sourceType, sourceName, status, byUser, month, year,
        productionVolume, operationHours, serviceInterruption, totalHoursServiceInterruption,
        electricityConsumption, electricityCost, bulkCost, bulkOuttake, bulkProvider,
        WTPCost, WTPSource, WTPVolume, disinfectionMode, disinfectantCost,
        disinfectionAmount, disinfectionBrandType, otherTreatmentCost,
        emergencyLitersConsumed, emergencyFuelCost, emergencyTotalHoursUsed,
        gensetLitersConsumed, gensetFuelCost, isActive, comment
    ) VALUES (
        @branchId, @sourceType, @sourceName, @status, @byUser, @month, @year,
        @productionVolume, @operationHours, @serviceInterruption, @totalHoursServiceInterruption,
        @electricityConsumption, @electricityCost, @bulkCost, @bulkOuttake, @bulkProvider,
        @WTPCost, @WTPSource, @WTPVolume, @disinfectionMode, @disinfectantCost,
        @disinfectionAmount, @disinfectionBrandType, @otherTreatmentCost,
        @emergencyLitersConsumed, @emergencyFuelCost, @emergencyTotalHoursUsed,
        @gensetLitersConsumed, @gensetFuelCost, @isActive, @comment
    );

    SELECT SCOPE_IDENTITY() AS id;
END
GO

PRINT 'spCreateMonthly stored procedure updated successfully!';
PRINT 'Changed @bulkOuttake parameter from FLOAT to NVARCHAR(255)'; 