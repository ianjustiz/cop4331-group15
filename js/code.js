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

    if (login === "" || password === "") {
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

    if (firstName === "" || lastName === "" || login === "" || password === "") {
        document.getElementById("registerResult").innerHTML = "Please fill all fields before registering";
        document.getElementById("registerFeedbackDiv").style.display = 'block';
        return;
    }

    if (!validReg(login, password)) {
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

                //window.location.href = "contacts.html";
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
    document.getElementById("searchText").value = "";
    doSearch(true);
}

function doSearch(clear = false) {
    let lastId = -1;
    let searchTerm = document.getElementById("searchText").value;
    let prevTable = document.getElementsByClassName("ContactRow");
    
    if (!clear && prevTable.length > 0) {
        lastId = parseInt(prevTable[prevTable.length - 1].id.split("-")[1]);
    }
    
    if (clear) {
        document.getElementById("searchResultTableBody").scrollTop = 0;
    }

    let tmp = {
        search: searchTerm,
        userId: userId,
        lastId: lastId
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
                if (lastId === -1) {
                    tableBody.innerHTML = ""; // Clear any existing rows
                }
                
                if (contactList.length === 0) {   
                    document.getElementById("searchResult").innerHTML = "No contacts found";
                    return;
                }

                // Loop through the contact list and generate table rows
                for (let i = 0; i < contactList.length; i++) {
                    let contact = contactList[i];
                    let row = tableBody.insertRow();
                    row.className = "ContactRow";
                    row.id = `row-${contact.ID}`;

                    // Fill in the contact details
                        row.innerHTML = `
                        <td><span id="firstName-${contact.ID}">${contact.FirstName}</span></td>
                        <td><span id="lastName-${contact.ID}">${contact.LastName}</span></td>
                        <td><span id="email-${contact.ID}">${contact.Email}</span></td>
                        <td><span id="phone-${contact.ID}">${contact.Phone}</span></td>
                        <td>
                            <button class="deleteButton" id="delete-${contact.ID}" onclick="deleteContactById(${contact.ID})"></button>
                            <button class="editButton" id="edit-${contact.ID}" onclick="setupUpdate(${contact.ID})"></button>
                        </td>
                    `;
                //     row.innerHTML = `
                //         <td><span id="firstName-${contact.ID}">${contact.FirstName}</span></td>
                //         <td><span id="lastName-${contact.ID}">${contact.LastName}</span></td>
                //         <td><span id="email-${contact.ID}">${contact.Email}</span></td>
                //         <td><span id="phone-${contact.ID}">${contact.Phone}</span></td>
                //         <td>
                //             <button id="delete-${contact.ID}" onclick="deleteContactById(${contact.ID})">
				// <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="M6 7H5v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7H6zm4 12H8v-9h2v9zm6 0h-2v-9h2v9zm.618-15L15 2H9L7.382 4H3v2h18V4z">
				// </path></svg></button>
                //             <button id="edit-${contact.ID}" onclick="setupUpdate(${contact.ID})">
				// <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);transform: ;msFilter:;"><path d="m16 2.012 3 3L16.713 7.3l-3-3zM4 14v3h3l8.299-8.287-3-3zm0 6h16v2H4z">
				// </path></svg></button>
                //         </td>
                //     `;
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

    let onInputFunc = `validateContactUpdate('${connId}')`;

    document.getElementById(`row-${connId}`).innerHTML = `
        <td><input oninput="${onInputFunc}" type="text" id="editFirstName-${connId}" value="${firstName}"></td>
        <td><input oninput="${onInputFunc}" type="text" id="editLastName-${connId}" value="${lastName}"></td>
        <td><input oninput="${onInputFunc}" type="text" id="editEmail-${connId}" value="${email}"></td>
        <td><input oninput="${onInputFunc}" type="text" id="editPhone-${connId}" value="${phone}"></td>
        <td>
            <button class="cancelButton" id="cancelButton-${connId}" onclick="cancelUpdate(${connId})"></button>
            <button class="saveButton" id="saveButton-${connId}" onclick="saveUpdate(${connId})"></button>
        </td>
    `;
}

function cancelUpdate(connId) {
    console.log("cancelUpdate");

    let firstName = document.getElementById(`editFirstName-${connId}`).value;
    let lastName = document.getElementById(`editLastName-${connId}`).value;
    let email = document.getElementById(`editEmail-${connId}`).value;
    let phone = document.getElementById(`editPhone-${connId}`).value;

    let row = document.getElementById(`row-${connId}`);
    row.innerHTML = `
        <td><span id="firstName-${connId}">${firstName}</span></td>
        <td><span id="lastName-${connId}">${lastName}</span></td>
        <td><span id="email-${connId}">${email}</span></td>
        <td><span id="phone-${connId}">${phone}</span></td>
        <td>
            <button class="deleteButton" id="delete-${connId}" onclick="deleteContactById(${connId})"></button>
            <button class="editButton" id="edit-${connId}" onclick="setupUpdate(${connId})"></button>
        </td>
    `;
}

function saveUpdate(connId) {
    console.log("saveUpdate");

    let firstName = document.getElementById(`editFirstName-${connId}`).value;
    let lastName = document.getElementById(`editLastName-${connId}`).value;
    let email = document.getElementById(`editEmail-${connId}`).value;
    let phone = document.getElementById(`editPhone-${connId}`).value;

    // validates input strings, corrects phone number format, returns "" on incorrectible invalid input
    phone = validateContact(firstName, lastName, email, phone);
    if (phone === "") {
        return;
    }

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
                    let row = document.getElementById(`row-${connId}`);
                    row.innerHTML = `
                        <td><span id="firstName-${connId}">${firstName}</span></td>
                        <td><span id="lastName-${connId}">${lastName}</span></td>
                        <td><span id="email-${connId}">${email}</span></td>
                        <td><span id="phone-${connId}">${phone}</span></td>
                        <td>
                            <button class="deleteButton" id="delete-${connId}" onclick="deleteContactById(${connId})"></button>

                            <button class="editButton" id="edit-${connId}" onclick="setupUpdate(${connId})"></button>
                        </td>
                    `;
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

function validateContact(newContactFirst, newContactLast, newContactEmail, newContactNumber) {
    if (newContactFirst === "" || newContactLast === "" || newContactEmail === "" || newContactNumber === "") {
        document.getElementById("contactAddResult").innerHTML = "Please populate all fields before submitting";
        return "";
    }
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newContactEmail)) {
        document.getElementById("contactAddResult").innerHTML = "Please enter a valid email address";
        return "";
    }
    let phoneRegexFull = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;
    let phoneRegexMini = /[0-9]{10}/;
    if (!phoneRegexFull.test(newContactNumber)) {
        if (!phoneRegexMini.test(newContactNumber)) {
            document.getElementById("contactAddResult").innerHTML = "Please enter a valid phone number";
            return "";
        }        
        newContactNumber = newContactNumber.slice(0, 3) + "-" + newContactNumber.slice(3, 6) + "-" + newContactNumber.slice(6, 10);
    }

    return newContactNumber;
}

function validateContactUpdate(connId) {    
    let firstName = document.getElementById(`editFirstName-${connId}`).value;
    let lastName = document.getElementById(`editLastName-${connId}`).value;
    let email = document.getElementById(`editEmail-${connId}`).value;
    let phone = document.getElementById(`editPhone-${connId}`).value;

    console.log(phone);
    let newPhone = validateContact(firstName, lastName, email, phone);
    if (newPhone === "") {
        document.getElementById(`saveButton-${connId}`).disabled = true;
        return;
    }
    else if (newPhone !== phone) {
        document.getElementById(`editPhone-${connId}`).value = newPhone;
        document.getElementById(`saveButton-${connId}`).disabled = false;
    }
    else {
        document.getElementById(`saveButton-${connId}`).disabled = false;
    }
}

function addContact() {
    let newContactFirst = document.getElementById("FName").value.trim();
    let newContactLast = document.getElementById("LName").value.trim();
    let newContactEmail = document.getElementById("email").value.trim();
    let newContactNumber = document.getElementById("phN").value.trim();
    readCookie();

    // validates input strings, corrects phone number format, returns "" on incorrectible invalid input
    newContactNumber = validateContact(newContactFirst, newContactLast, newContactEmail, newContactNumber);
    if (newContactNumber === "") {
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

function toContacts() {
    if(window.location.href !== 'http://www.cop4331-team15.lol/contacts.html') {
        window.location.href = 'contacts.html';
        readCookie();
    }
}

function toAboutUs() {
    if(firstName)
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
                document.getElementById(`row-${contactId}`).remove();
                // doSearch(); 
            }
        }
    };
    xhr.send(jsonPayload);
}

function scrollFunction() {
    let table = document.getElementById("searchResultTableBody");
    // if scroll is at the bottom searchTableResults

    if (table.scrollHeight - table.scrollTop < table.clientHeight + 10) {
        console.log("yeah");
        doSearch();
    }
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

function validReg(login, password) {
    console.log("in validReg");
    let lErr = true;
    let pErr = true;

    if (login !== "") {
        let regex = /^[a-zA-Z0-9-_]{5,15}$/;
        if (!regex.test(login)) {
            console.log("USERNAME IS NOT VALID");
        } else {
            console.log("USERNAME IS VALID");
            lErr = false;  // Update the correct variable
        }
    }

    if (password !== "") {
        let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!regex.test(password)) {
            console.log("PASSWORD IS NOT VALID");
        } else {
            console.log("PASSWORD IS VALID");
            pErr = false;  // Update the correct variable
        }
    }

    if (lErr || pErr) {
        return false;
    }

    return true; 
}
