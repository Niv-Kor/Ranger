-- Tables
CREATE TABLE Targets (
	id INT NOT NULL IDENTITY(1,1),
	target_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(20) NOT NULL,
	image_name VARCHAR(21) NOT NULL,
	image_path VARCHAR(256) NOT NULL,
	center_x DECIMAL(6,3) DEFAULT NULL,
	center_y DECIMAL(6,3) DEFAULT NULL,
	rings INT DEFAULT 1,
	rings_diameter INT DEFAULT 10,
	active TINYINT DEFAULT 1,
	creation_date VARCHAR(19) DEFAULT '0000-00-00 00:00',

	PRIMARY KEY(id),

	CONSTRAINT FK_Targets_Users_email
	FOREIGN KEY(target_owner) REFERENCES Users(email) ON DELETE CASCADE,

	CONSTRAINT unique_target UNIQUE CLUSTERED (
		target_owner, image_name
	)
);
GO

-- insert default targets
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
GO

-- Procedures
ALTER PROCEDURE TargetExists
	@user VARCHAR(70),
	@image_name VARCHAR(21)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS target_exists
	FROM Targets
	WHERE target_owner = @user
	  AND image_name = @image_name
	  AND active = 1
END
GO

ALTER PROCEDURE GetTargetId
	@user VARCHAR(70),
	@image_name VARCHAR(21)
AS
BEGIN
	SELECT id
	FROM Targets
	WHERE target_owner = @user
	  AND image_name = @image_name
END
GO

ALTER PROCEDURE AddTarget
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@image_name VARCHAR(21),
	@image_path VARCHAR(256),
	@cx DECIMAL(6,3),
	@cy DECIMAL(6,3),
	@rings INT,
	@diam INT,
	@date VARCHAR(19)
AS
BEGIN
	INSERT INTO Targets(target_owner,
						discipline,
						image_name,
						image_path,
						center_x,
						center_y,
						rings,
						rings_diameter,
						creation_date)
	VALUES (
		@user,
		@discipline,
		@image_name,
		@image_path,
		@cx,
		@cy,
		@rings,
		@diam,
		@date
	)
END
GO

ALTER PROCEDURE GetTargets
	@user VARCHAR(70),
	@get_non_active TINYINT
AS
BEGIN
	SELECT *
	FROM Targets
	WHERE target_owner = @user
	  AND active + @get_non_active > 0
END
GO

CREATE PROCEDURE UpdateTarget
	@id INT,
	@new_center_x DECIMAL(6,3),
	@new_center_y DECIMAL(6,3),
	@new_rings_amount INT,
	@new_diameter INT
AS
BEGIN
	UPDATE Targets
	SET center_x = ISNULL(@new_center_x, center_x),
		center_y = ISNULL(@new_center_y, center_y),
		rings = ISNULL(@new_rings_amount, rings),
		rings_diameter = ISNULL(@new_diameter, rings_diameter)
	WHERE id = @id
END
GO

ALTER PROCEDURE DeleteOrphinTargets
	@user VARCHAR(70)
AS
BEGIN
	DELETE FROM Targets
	WHERE active = 0
	  AND id NOT IN (SELECT r.target_id
					 FROM Ranges r
					 INNER JOIN Journals j ON j.id = r.journal_id 
					 WHERE j.journal_owner = @user)
END
GO

ALTER PROCEDURE DeleteTarget
	@user VARCHAR(70),
	@id INT
AS
BEGIN
	DECLARE
		@common_targets TABLE(
			discipline VARCHAR(20) NOT NULL,
			target_id INT NOT NULL
		)
	
	-- get 1 common selected target for each discipline
	INSERT INTO @common_targets(discipline, target_id)
	SELECT j.discipline AS discipline, MIN(t.id) AS target_id
	FROM Journals j
	INNER JOIN Targets t ON j.discipline = t.discipline
	WHERE j.journal_owner = @user
	GROUP BY j.discipline

	-- set default target as the selected common target for each
	-- journal that uses the deleted target as its default
	Update Journals
	SET target_id = (SELECT c.target_id
					 FROM @common_targets c
					 WHERE c.discipline = (SELECT j.discipline
										   FROM Journals j
										   WHERE j.target_id = @id))
	WHERE journal_owner = @user
	  AND target_id = @id

	-- delete target permanently if it's not used in any range
	DELETE FROM Targets
	WHERE id = @id
	  AND @id NOT IN (SELECT DISTINCT r.target_id
					  FROM Ranges r
					  INNER JOIN Journals j ON j.id = r.journal_id
					  WHERE j.journal_owner = @user
					    AND r.target_id = @id)
	
	-- deactivate the target if it is being used
	UPDATE Targets
	SET active = 0,
		image_name = '~' + image_name
	WHERE id = @id
	  AND active = 1
END
GO

-- Exec
SELECT * FROM Targets
GO

DELETE FROM Targets
WHERE target_owner != 'default'
GO

DELETE FROM Targets
WHERE id = 27