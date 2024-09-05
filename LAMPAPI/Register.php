<?php

	$inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else
    {
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $inData["login"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if( $result->fetch_assoc() )
        {
            returnWithError("Username already exists");
        }
        else
        {
            $stmt = $conn->prepare("INSERT INTO Users (Login,Password,FirstName,LastName) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $inData["login"], $inData["password"], $inData["firstName"], $inData["lastName"]);
            $stmt->execute();
            
            $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
            $stmt->bind_param("s", $inData["login"]);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            
            returnWithInfo($row["ID"], $inData["firstName"], $inData["lastName"]);
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"id":0, "firstName":"", "lastName":"", "error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithInfo($id, $firstName, $lastName)
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }
?>