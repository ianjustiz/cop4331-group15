<?php
    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else
    {
        // rudimentary deletion criteria, needs to be updated to account
        // for an account having multiple contacts with the same name
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID=? AND FirstName=? AND LastName=?");
        $stmt->bind_param("iss", $inData["id"], $inData["firstName"], $inData["lastName"]);
        $stmt->execute();

        $stmt->close();
        $conn->close();

        returnWithInfo($inData["id"], $inData["firstName"], $inData["lastName"]);
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
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    function returnWithInfo( $id, $firstName, $lastName )
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }
?>