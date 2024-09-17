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

    document.getElementById("loginFeedbackDiv").style.display = 'none';

    if (validateInput(login) || validateInput(password)) {
        document.getElementById("loginResult").innerHTML = "Please Insert a Username and Password";
        document.getElementById("loginFeedbackDiv").style.display = 'block';
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
                    document.getElementById("loginResult").innerHTML = "User/Password Combination Incorrect";
                    document.getElementById("loginFeedbackDiv").style.display = 'block';
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
        document.getElementById("loginFeedbackDiv").style.display = 'block';
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
        document.getElementById("registerFeedbackDiv").style.display = 'block';
        return;
    }
    let passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!passwordRegex.test(password)) {
        document.getElementById("registerResult").innerHTML = "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, and 1 number";
        document.getElementById("registerFeedbackDiv").style.display = 'block';
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
                    document.getElementById("registerFeedbackDiv").style.display = 'block';
                    return;
                }

                userId = jsonObject.id;

                saveCookie();

                document.getElementById("registerResult").innerHTML = "User has been registered";
                document.getElementById("registerFeedbackDiv").style.display = 'block';

                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
        document.getElementById("registerFeedbackDiv").style.display = 'block';

    }
}

function showAllContacts() {
    document.getElementById("searchText").value = ""; // Clear the search text box
    doSearch();
}


function doSearch() {
    let searchTerm = document.getElementById("searchText").value;

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

                if (contactList.length === 0) {   
                    document.getElementById("searchResult").innerHTML = "No contacts found";
                    return;
                }

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
                            <button id="delete-${contact.ID}" onclick="deleteContactById(${contact.ID})">Delete</button>
                            <button id="edit-${contact.ID}" onclick="setupUpdate(${contact.ID})">Edit</button>
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

function setupUpdate(connId) {
    console.log("updateContact", `firstName-${connId}`);
    
    let firstName = document.getElementById(`firstName-${connId}`).innerText;
    let lastName = document.getElementById(`lastName-${connId}`).innerText;
    let email = document.getElementById(`email-${connId}`).innerText;
    let phone = document.getElementById(`phone-${connId}`).innerText;

    document.getElementById(`row-${connId}`).innerHTML = `
        <td><input type="text" id="editFirstName-${connId}" value="${firstName}"></td>
        <td><input type="text" id="editLastName-${connId}" value="${lastName}"></td>
        <td><input type="text" id="editEmail-${connId}" value="${email}"></td>
        <td><input type="text" id="editPhone-${connId}" value="${phone}"></td>
        <td>
            <button onclick="doSearch()">Cancel</button>
            <button onclick="saveUpdate(${connId})">Save</button>
        </td>
    `;
}

function saveUpdate(connId) {
    console.log("saveUpdate");

    let firstName = document.getElementById(`editFirstName-${connId}`).value;
    let lastName = document.getElementById(`editLastName-${connId}`).value;
    let email = document.getElementById(`editEmail-${connId}`).value;
    let phone = document.getElementById(`editPhone-${connId}`).value;

    let tmp = {
        id: connId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UpdateContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    console.error("Error updating contact:", jsonObject.error);
                } else {
                    console.log("Contact updated successfully");
                    doSearch();
                }
            }
        };
        xhr.send(jsonPayload);
    } 
    catch (err) {
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
        //window.location.href = "index.html";
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
    let newContactFirst = document.getElementById("FName").value.trim();
    let newContactLast = document.getElementById("LName").value.trim();
    let newContactEmail = document.getElementById("email").value.trim();
    let newContactNumber = document.getElementById("phN").value.trim();
    readCookie();

    if (newContactFirst === "" || newContactLast === "" || newContactEmail === "" || newContactNumber === "") {
        document.getElementById("contactAddResult").innerHTML = "Please populate all fields before submitting";
        return 0;
    }
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContactEmail)) {
        document.getElementById("contactAddResult").innerHTML = "Please enter a valid email address";
        return 0;
    }
    let phoneRegexFull = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;
    let phoneRegexMini = /[0-9]{10}/;
    if (!phoneRegexFull.test(newContactNumber)) {
        if (!phoneRegexMini.test(newContactNumber)) {
            document.getElementById("contactAddResult").innerHTML = "Please enter a valid phone number";
            return 0;
        }        
        newContactNumber = newContactNumber.slice(0, 3) + "-" + newContactNumber.slice(3, 6) + "-" + newContactNumber.slice(6, 10);
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

function deleteContactById(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }

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

function scrollFunction() {
    
}

function dragElement(ele) {
    var p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    
    ele.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        if (e.target.id === "addContBox") {
            p3 = e.clientX;
            p4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        else {
            e.target.focus();
        }
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        p1 = p3 - e.clientX;
        p2 = p4 - e.clientY;
        p3 = e.clientX;
        p4 = e.clientY;
        ele.style.top = (ele.offsetTop - p2) + "px";
        ele.style.left = (ele.offsetLeft - p1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

