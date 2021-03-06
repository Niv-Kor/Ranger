-- Tables
CREATE TABLE Users (
	email VARCHAR(70) NOT NULL,
	hashPass VARCHAR(512) NOT NULL,
	username VARCHAR(20) NOT NULL,

	PRIMARY KEY(email)
);
GO

-- Procedures
ALTER PROCEDURE SignUp
    @email VARCHAR(70),   
    @hash VARCHAR(512),
	@username VARCHAR(20)
AS
BEGIN
    INSERT INTO Users(email, hashPass, username)
	VALUES (
		@email,
		@hash,
		@username
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

-- insert default user
INSERT INTO Users(email, hashPass, username)
VALUES(
	'default',
	'hFnXXeJR8eIsqI8InNuiTnXy
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
	SiHUD',
	'default'
)
GO

CREATE PROCEDURE GetAccountData
	@email VARCHAR(70)
AS
BEGIN
	SELECT username
	FROM Users
	WHERE email = @email
END
GO

CREATE PROCEDURE UpdateAccountData
	@old_email VARCHAR(70),
	@new_email VARCHAR(70),
	@new_hash_pass VARCHAR(512),
	@new_username VARCHAR(20)
AS
BEGIN
	UPDATE Users
	SET email = ISNULL(@new_email, email),
		hashPass = ISNULL(@new_hash_pass, hashPass),
		username = ISNULL(@new_username, username)
	WHERE email = @old_email
END
GO

-- Exec
SELECT * FROM Users
GO

DROP TABLE Users
GO