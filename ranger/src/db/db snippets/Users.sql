-- Tables
CREATE TABLE Users (
	email VARCHAR(70) NOT NULL,
	hashPass VARCHAR(512) NOT NULL,

	PRIMARY KEY(email)
);
GO

-- Procedures
ALTER PROCEDURE SignUp
    @email VARCHAR(70),   
    @hash VARCHAR(512)
AS
BEGIN
    INSERT INTO Users(email, hashPass)
	VALUES (
		@email,
		@hash
	)
END
GO

ALTER PROCEDURE ValidateUser
    @email VARCHAR(70),   
    @hash VARCHAR(512)   
AS
BEGIN
    SELECT CAST(COUNT(1) AS BIT) AS is_valid
	FROM Users
	WHERE email = @email
	  AND hashPass = @hash COLLATE SQL_Latin1_General_CP1_CS_AS
END
GO

ALTER PROCEDURE GetUserHashedPassword
	@email VARCHAR(70)
AS
BEGIN
	SELECT hashPass
	FROM Users
	WHERE email = @email
END
GO

INSERT INTO Users(email, hashPass)
VALUES('default', 'hFnXXeJR8eIsqI8InNuiTnXy
				   /jVVPtZymeRaCcrj4LaxYAob
				   CfhYYQMAaoLuNb1vG9RCXIya
				   RW/8MSVIve/rwlY7DuxtssZr
				   rpsxza2Hwcj+MrlOfEILGgSO
				   8EY4Z052EWzhGdB8Onot9+xC
				   vEkho8LD17v8rr9Ki7gIjFLz
				   XidFRAOdO4sOV9oPSmcdTf2E
				   RtnsqpIugY4/bTujbdRmONwy
				   IqndoGLSU7fFbl724VUOCDWU
				   V9NzOs2BbbxnfolhQk7gNilq
				   rMSKpITyGw1q2aHgTzuw4scp
				   FXYsRYJ7eVNxb9ajfAoBOwAF
				   ri82w9r9TISeG1JfzENOfpf
				   SiHUD')

-- Exec
SELECT * FROM Users
GO

DROP TABLE Users