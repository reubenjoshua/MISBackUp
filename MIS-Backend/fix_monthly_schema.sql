-- Fix Monthly table schema inconsistencies
-- Change string fields from FLOAT to varchar(128)

USE MISDb;
GO

-- Fix bulkOuttake field (should be varchar, not float)
ALTER TABLE Monthly 
ALTER COLUMN bulkOuttake varchar(128);

-- Fix bulkProvider field (should be varchar, not float) 
ALTER TABLE Monthly 
ALTER COLUMN bulkProvider varchar(128);

-- Fix WTPSource field (should be varchar, not float)
ALTER TABLE Monthly 
ALTER COLUMN WTPSource varchar(128);

-- Update existing data to convert numeric values to strings where needed
-- This is a safety measure in case there's existing data that needs conversion
UPDATE Monthly 
SET bulkOuttake = CAST(bulkOuttake AS varchar(128)) 
WHERE bulkOuttake IS NOT NULL;

UPDATE Monthly 
SET bulkProvider = CAST(bulkProvider AS varchar(128)) 
WHERE bulkProvider IS NOT NULL;

UPDATE Monthly 
SET WTPSource = CAST(WTPSource AS varchar(128)) 
WHERE WTPSource IS NOT NULL;

PRINT 'Monthly table schema updated successfully!';
PRINT 'Fields updated: bulkOuttake, bulkProvider, WTPSource';
PRINT 'All string fields are now properly typed as varchar(128)'; 