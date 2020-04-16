-- Tables
CREATE TABLE Targets (
	id INT NOT NULL IDENTITY(1,1),
	target_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(30) NOT NULL,
	image_name VARCHAR(128) NOT NULL,
	image_path VARCHAR(512) NOT NULL,
	center_x DECIMAL(6,3) DEFAULT NULL,
	center_y DECIMAL(6,3) DEFAULT NULL,
	rings INT DEFAULT 1,
	rings_diameter INT DEFAULT 10

	PRIMARY KEY(id)
);
GO

DROP TABLE Targets

INSERT INTO Targets(target_owner,
					discipline,
					image_name,
					image_path,
					center_x,
					center_y,
					rings,
					rings_diameter)
VALUES
('default', 'Archery', 'fita', '/db/targets/default/fita.png', 50, 50, 10, 10),
('default', 'Archery', 'fita_field', '/db/targets/default/fita_field.png', 50, 50, 11, 10),
('default', 'Firearm', 'issf_air_pistol', '/db/targets/default/issf_air_pistol.png', 50, 50, 10, 10),
('default', 'Archery', 'issf_air_rifle', '/db/targets/default/issf_air_rifle.png', 50, 50, 10, 10),
('default', 'Archery', 'issf_rapid_fire_pistol', '/db/targets/default/issf_rapid_fire_pistol.png', 50, 50, 10, 10)

SELECT * FROM Targets

UPDATE Targets
SET rings_diameter = 10
WHERE id = 2

-- Procedures
ALTER PROCEDURE TargetExists
	@user VARCHAR(70),
	@discipline VARCHAR(30),
	@image_name VARCHAR(64)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS target_exists
	FROM Targets
	WHERE target_owner = @user
	  AND discipline = @discipline
	  AND image_name = @image_name
END
GO

CREATE PROCEDURE GetTargetId
	@user VARCHAR(70),
	@discipline VARCHAR(30),
	@image_name VARCHAR(64)
AS
BEGIN
	SELECT id
	FROM Targets
	WHERE target_owner = @user
	  AND discipline = @discipline
	  AND image_name = @image_name
END
GO

CREATE PROCEDURE AddTarget
	@user VARCHAR(70),
	@discipline VARCHAR(30),
	@image_name VARCHAR(64),
	@image_path VARCHAR(512),
	@cx DECIMAL(6,3),
	@cy DECIMAL(6,3),
	@rings INT,
	@diam INT
AS
BEGIN
	INSERT INTO Targets(target_owner,
						discipline,
						image_name,
						image_path,
						center_x,
						center_y,
						rings,
						rings_diameter)
	VALUES (
		@user,
		@discipline,
		@image_name,
		@image_path,
		@cx,
		@cy,
		@rings,
		@diam
	)
END
GO

-- Exec
SELECT * FROM CustomTargets;
GO