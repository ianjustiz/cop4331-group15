const urlBase = 'http://www.cop4331-team15.lol/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;
    //var hash = md5(password);

    if (validateInput(login) || validateInput(password)) {
        document.getElementById("loginResult").innerHTML = "Please insert a username and password";
        return;
    }

    document.getElementById("loginResult").innerHTML = "";

    let tmp = { login: login, password: password };
    // var tmp = {login: login, password: hash};
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    return;
                }
                
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function doRegister() {
    console.log("doRegister :)");

    userId = 0;
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;

    let login = document.getElementById("regLoginName").value;
    let password = document.getElementById("regPassword").value;

    if (validateInput(firstName) || validateInput(lastName) || validateInput(login) || validateInput(password)) {
        document.getElementById("registerResult").innerHTML = "Please fill all fields before registering";
        return;
    }

    document.getElementById("registerResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error == "Username already exists") {
                    document.getElementById("registerResult").innerHTML = "Username already taken";
                    return;
                }

                userId = jsonObject.id;

                saveCookie();

                document.getElementById("registerResult").innerHTML = "User has been registered";

                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function doSearch() {
    let srch = document.getElementById("searchText").value;

    let contactList = [];

    let tmp = { search: srch, userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                for (let i = 0; i < jsonObject.results.length; i++) {
                    contactList.push(jsonObject.results[i]);
                }

                let table = document.createElement("tbody");
                table.setAttribute("id", "searchResultTableBody");

                for (let i = 0; i < contactList.length; i++) {
                    let row = table.insertRow(i);
                    let cell1 = row.insertCell(0);
                    let cell2 = row.insertCell(1);
                    let cell3 = row.insertCell(2);
                    let cell4 = row.insertCell(3);
                    let cell5 = row.insertCell(4);

                    cell1.innerHTML = contactList[i]["FirstName"];
                    cell2.innerHTML = contactList[i]["LastName"];
                    cell3.innerHTML = contactList[i]["Email"];
                    cell4.innerHTML = contactList[i]["Phone"];
                    cell5.innerHTML =
                        '<button type="button" class="buttons" onclick="deleteContact(' + contactList[i] + ')">Delete</button>' +
                        '<button type="button" class="buttons" onclick="updateContact(' + contactList[i] + ')">Edit</button>';
                }

                document.getElementById("searchResultTableBody").replaceWith(table);
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("searchResult").innerHTML = err.message;
    }
}

function deleteContact(contact) {
    console.log("deleteContact");
}

function updateContact(contact) {
    console.log("updateContact");
}

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for (var i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        }
        else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        }
        else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }

    if (userId < 0) {
        window.location.href = "index.html";
    }
    else {
        document.getElementById("userName1").innerHTML = firstName;
    }
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "index.html";
}

function addContact() {
    let newContactFirst = document.getElementById("FName").value;
    let newContactLast = document.getElementById("LName").value;
    let newContactEmail = document.getElementById("email").value;
    let newContactNumber = document.getElementById("phN").value;
    readCookie();

    if (newContactFirst === "" || newContactLast === "" || newContactEmail === "" || newContactNumber === "") {
        document.getElementById("contactAddResult").innerHTML = "Please populate all fields before submitting";
        return 0;
    }
    document.getElementById("contactAddResult").innerHTML = "";

    let tmp = {
        userId: userId,
        email: newContactEmail,
        phone: newContactNumber,
        firstName: newContactFirst,
        lastName: newContactLast
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/AddContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("contactAddResult").innerHTML = "Contact has been added";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("contactAddResult").innerHTML = err.message;
    }

}

function validateInput(s) {
    // add further validation here for now just check if empty
    return s === "";
}

function searchColor() {
    let srch = document.getElementById("searchText").value;
    document.getElementById("colorSearchResult").innerHTML = "";

    let colorList = "";

    let tmp = { search: srch, userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchColors.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
                let jsonObject = JSON.parse(xhr.responseText);

                for (let i = 0; i < jsonObject.results.length; i++) {
                    colorList += jsonObject.results[i];
                    if (i < jsonObject.results.length - 1) {
                        colorList += "<br />\r\n";
                    }
                }

                document.getElementsByTagName("p")[0].innerHTML = colorList;
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("colorSearchResult").innerHTML = err.message;
    }

}

function toContacts() {
    window.location.href = 'contacts.html';
    readCookie();
}

function toAboutUs() {
    window.location.href = 'aboutus.html';
    readCookie();
    document.getElementById("userName1").innerHTML = firstName;
}
