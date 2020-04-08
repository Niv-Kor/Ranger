-- Tables
CREATE TABLE CustomTargets (
	target_owner VARCHAR(70) NOT NULL,
	image_name VARCHAR(128) NOT NULL,
	image_type VARCHAR(16) NOT NULL,
	image_path VARCHAR(512) NOT NULL

	PRIMARY KEY(target_owner, image_name, image_type)
);
GO

-- Procedures
ALTER PROCEDURE CustomTargetExists
	@user VARCHAR(512),
	@image_name VARCHAR(128),
	@image_type VARCHAR(16)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS target_exists
	FROM CustomTargets
	WHERE target_owner = @user
	  AND image_name = @image_name
	  AND image_type = @image_type
END
GO

ALTER PROCEDURE AddCustomTarget
	@user VARCHAR(70),
	@image_name VARCHAR(128),
	@image_type VARCHAR(16),
	@image_path VARCHAR(512)
AS
BEGIN
	INSERT INTO CustomTargets(target_owner,
							  image_name,
							  image_type,
							  image_path)
	VALUES (
		@user,
		@image_name,
		@image_type,
		@image_path
	)
END
GO

-- Exec
SELECT * FROM CustomTargets;
GO