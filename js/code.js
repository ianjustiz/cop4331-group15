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

    // Call showAllContacts with the search term
    showAllContacts(srch);
}


function showAllContacts(searchTerm = "") {
    let tmp = {
        search: searchTerm,
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                let contactList = jsonObject.results;

                let tableBody = document.getElementById("searchResultTableBody");
                tableBody.innerHTML = ""; // Clear any existing rows

                // Loop through the contact list and generate table rows
                for (let i = 0; i < contactList.length; i++) {
                    let contact = contactList[i];
                    let row = tableBody.insertRow();
                    row.id = `row-${contact.ID}`;

                    // Fill in the contact details
                    row.innerHTML = `
                        <td><span id="firstName-${contact.ID}">${contact.FirstName}</span></td>
                        <td><span id="lastName-${contact.ID}">${contact.LastName}</span></td>
                        <td><span id="email-${contact.ID}">${contact.Email}</span></td>
                        <td><span id="phone-${contact.ID}">${contact.Phone}</span></td>
                        <td>
                            <button onclick="deleteContact('${contact.FirstName}','${contact.LastName}', '${contact.Email}', '${contact.Phone}')">Delete</button>
                            <button onclick="editContact(${contact.ID})">Edit</button>
                        </td>
                    `;
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("searchResult").innerHTML = err.message;
    }
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
        document.getElementById("userName").innerHTML = firstName;
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


function toContacts() {
    window.location.href = 'contacts.html';
    readCookie();
}

function toAboutUs() {
    console.log(firstName)
    window.location.href = 'aboutus.html?user=' + encodeURIComponent(firstName);
}

function updateContact(contact) {
    console.log("updateContact");
}

function deleteContact(firstName, lastName, email, phone) {
    console.log("deleteContact");                                                               
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        userId: userId
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/GetContactID.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            
            if (jsonObject.error) {
                console.error("Error getting contact ID:", jsonObject.error);
                return;
            }

            let contactId = jsonObject.id;
            
            deleteContactById(contactId);
        }
    };
    xhr.send(jsonPayload);
}

function deleteContactById(contactId) {
    let tmp = {
        id: contactId
    };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            
            if (jsonObject.error) {
                console.error("Error deleting contact:", jsonObject.error);
            } else {
                console.log("Contact deleted successfully");
                doSearch(); 
            }
        }
    };
    xhr.send(jsonPayload);
}
