-- Tables
CREATE TABLE Hits (
	id INT IDENTITY(1,1),
	range_id INT NOT NULL,
	coord_x DECIMAL NOT NULL,
	coord_y DECIMAL NOT NULL,
	score INT NOT NULL,
	end_no INT NOT NULL,

	PRIMARY KEY(id),
	FOREIGN KEY(range_id) REFERENCES Ranges(id)
)

-- Procedures

-- Exec
SELECT * FROM Hits
DROP TABLE Hits