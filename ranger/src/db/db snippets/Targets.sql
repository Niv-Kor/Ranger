-- Tables
CREATE TABLE Targets (
	id INT NOT NULL IDENTITY(1,1),
	target_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(20) NOT NULL,
	image_name VARCHAR(20) NOT NULL,
	image_path VARCHAR(256) NOT NULL,
	center_x DECIMAL(6,3) DEFAULT NULL,
	center_y DECIMAL(6,3) DEFAULT NULL,
	rings INT DEFAULT 1,
	rings_diameter INT DEFAULT 10,

	PRIMARY KEY(id),

	CONSTRAINT unique_target UNIQUE CLUSTERED (
		target_owner, image_name
	)
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
('default', 'Archery', 'FITA', '/db/targets/default/FITA.png', 50, 50, 10, 10),
('default', 'Archery', 'FITA Field', '/db/targets/default/FITA Field.png', 50, 50, 11, 10),
('default', 'Firearm', 'ISSF Air Pistol', '/db/targets/default/ISSF Air Pistol.png', 50, 50, 10, 10),
('default', 'Firearm', 'ISSF Air Rifle', '/db/targets/default/ISSF Air Rifle.png', 50, 50, 10, 10),
('default', 'Firearm', 'ISSF Rapid Fire', '/db/targets/default/ISSF Rapid Fire.png', 50, 50, 10, 10)

-- Procedures
ALTER PROCEDURE TargetExists
	@user VARCHAR(70),
	@image_name VARCHAR(20)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS target_exists
	FROM Targets
	WHERE target_owner = @user
	  AND image_name = @image_name
END
GO

ALTER PROCEDURE GetTargetId
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@image_name VARCHAR(20)
AS
BEGIN
	SELECT id
	FROM Targets
	WHERE target_owner = @user
	  AND discipline = @discipline
	  AND image_name = @image_name
END
GO

ALTER PROCEDURE AddTarget
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@image_name VARCHAR(20),
	@image_path VARCHAR(256),
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

CREATE PROCEDURE GetTargets
	@user VARCHAR(70)
AS
BEGIN
	SELECT *
	FROM Targets
	WHERE target_owner = @user
END
GO

-- Exec
SELECT * FROM Targets

DELETE FROM Targets

GO