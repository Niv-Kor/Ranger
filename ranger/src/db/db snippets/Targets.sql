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
	active TINYINT DEFAULT 1,

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

CREATE PROCEDURE DeleteTarget
	@user VARCHAR(70),
	@id INT
AS
BEGIN
	-- delete target if it's not contained in any journal nor ranges
	DELETE FROM Targets
	WHERE id = @id
	  AND @id NOT IN (SELECT DISTINCT j0.target_id
	  		      	  FROM Journals j0
					  WHERE j0.journal_owner = @user
				  	    AND j0.target_id = @id
					  UNION
					  SELECT DISTINCT r.target_id
					  FROM Ranges r
					  INNER JOIN Journals j1 ON j1.id = r.journal_id
					  WHERE j1.journal_owner = @user
					    AND r.target_id = @id)
	
	-- deactivate the target if it's being used
	UPDATE Targets
	SET active = 0
	WHERE id = @id
END
GO

-- Exec
SELECT * FROM Targets
GO

DELETE FROM Targets
WHERE id > 12
GO