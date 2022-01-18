// DISPLAY FUNCTIONS
// Table display
function tableDisplay(object, tableId) {
	let content = "";

	switch (tableId) {
		case "personnel":
			if (object.data.length == 0) {
				content = '<tr><td colspan="3">No personnel records match search criteria.</td></tr>';
			} else {
				for (const [key, value] of Object.entries(object.data)) {
					content += `
                    <tr>
                        <td class="id">${value.id}</td>
						<td class="first d-none d-md-table-cell">${value.firstName}</td>
						<td class="last">${value.lastName}</td>
						<td class="dept d-none d-md-table-cell">${value.department}</td>
						<td class="actions align-middle">
							<div class="btn-group" role="group">
								<button id="personViewBtn" class="btn text-primary" data-bs-toggle="modal" data-bs-target="#personModal"><i class="fas fa-id-card"></i></button>
								<button id="editBtn" class="btn text-primary" data-bs-toggle="modal" data-bs-target="#editModal"><i class="fas fa-edit"></i></button>
								<button id="deleteBtn" class="btn text-danger" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash-alt"></i></button>
							</div>
						</td>
					</tr>
                    `;
				}
			}
			break;

		case "department":
			if (object.data.length == 0) {
				content = '<tr><td colspan="3">No departments match search criteria.</td></tr>';
			} else {
				for (const [key, value] of Object.entries(object.data)) {
					content += `
					<tr>
						<td class="id">${value.id}</td>
						<td>${value.name}</td>
						<td class="d-none d-md-table-cell">${value.location}</td>
						<td class="actions align-middle">
							<div class="btn-group" role="group">
								<button id="editBtn" class="btn text-primary" data-bs-toggle="modal" data-bs-target="#editModal"><i class="fas fa-edit"></i></button>
								<button id="deleteBtn" class="btn text-danger" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash-alt"></i></button>
							</div>
						</td>
					</tr>`;
				}
			}
			break;

		case "location":
			if (object.data.length == 0) {
				content = '<tr><td colspan="2">No locations match search criteria.</td></tr>';
			} else {
				for (const [key, value] of Object.entries(object.data)) {
					content += `
					<tr>
						<td class="id">${value.id}</td>
						<td>${value.name}</td>
						<td class="actions align-middle">
							<div class="btn-group" role="group">
								<button id="editBtn" class="btn text-primary" data-bs-toggle="modal" data-bs-target="#editModal"><i class="fas fa-edit"></i></button>
								<button id="deleteBtn" class="btn text-danger" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash-alt"></i></button>
							</div>
						</td>
					</tr>`;
				}
			}
			break;
	}
	
	$(`#${tableId}Table`).html(content);
}
// filter display
function displayCheckbox(object, displayId, name) {
	let content = `<h6>${name}</h6>`;
	for(let i = 0; i < object.data.length; i++){
		content += `
		<div class="form-check">
			<input class="form-check-input" type="checkbox" value="${object.data[i].name}" id="${displayId}${i}">
			<label class="form-check-label" for="${displayId}${i}">${object.data[i].name}</label>
		</div>`;
	}
	$(`#${displayId}`).html(content);
}
// display new modals
function newModal(type) {
	let content = ""
	switch (type) {
		case "personnel":
			content = `
			<div class="row">
				<div class="form-group col-12 col-md-6">
					<label for="firstName">First Name<span class="text-danger">*</span></label>
					<input type="text" id="firstName" class="form-control form-required" placeholder="First Name">
				</div>
				<div class="form-group col-12 col-md-6">
					<label for="lastName">Last Name<span class="text-danger">*</span></label>
					<input type="text" id="lastName" class="form-control form-required" placeholder="Last Name">
				</div>
			</div>
			<div class="form-group col-12">
				<label for="addTitle">Job Title</label>
				<input type="text" id="addTitle" class="form-control" placeholder="Job Title">
			</div>
			<div class="form-group col-12">
				<label for="newEmail">Email<span class="text-danger">*</span></label>
				<input type="email" id="newEmail" class="form-control form-required" placeholder="Email">
			</div>
			<div class="row">
				<div class="form-group col-12 col-md-6">
					<label for="addDepartment">Department<span class="text-danger">*</span></label>
					<select id="addDepartment" class="form-control form-required">${getDepartments()}</select>
				</div>
				<div class="form-group col-12 col-md-6">
					<label for="addLocation">Location<span class="text-danger">*</span></label>
					<select id="addLocation" class="form-control form-required" readonly disabled>${getLocations()}</select>
				</div>
			</div>`;
			break;

		case "department":
			content = `
			<div class="form-group">
				<label for="addDepartment">Department Name<span class="text-danger">*</span></label>
				<input type="text" id="addDepartment" class="form-control form-required">
			</div>
			<div class="form-group">
				<label for="addLocation">Department Location<span class="text-danger">*</span></label>
				<select id="addLocation" class="form-control form-required">${getLocations()}</select>
			</div>`;
			break;

		case "location":
			content = `
			<div class="form-group">
				<label for="addLocation">Location Name<span class="text-danger">*</span></label>
				<input type="text" id="addLocation" class="form-control form-required">
			</div>`;
			break;
	}
	$("#newType").html(type).css("text-transform", "capitalize");
	$("#newForm").html(content);
	// $("#newModal").modal("show");
}
// display options
function displayOptions(object, selectedValue) {
	let content = "";
	if (selectedValue == '') {
		content += '<option selected hidden value="">Select...</option>';
	}
	for (const [key, value] of Object.entries(object.data)) {
		if (value.id == selectedValue) {
			content += `<option value="${value.id},${value.locationID}" selected>${value.name}</option>`;
		} else {
			content += `<option value="${value.id},${value.locationID}" >${value.name}</option>`;	
		}
	}
	return content;
}
// display selected location
function displaySelectedLocation(result) {
	let id = result.data[0].id;
	let name = result.data[0].name;
	let content = `<option value="${id}" selected>${name}</option>`;

	return content;
}
// display person modal
function viewModal(object) {
	$("#personModal #personName").html(`${object.data.personnel[0].firstName} ${object.data.personnel[0].lastName}`);
	$("#personModal #personDepartment").html(`Department: ${object.data.personnel[0].department}`);
	$("#personModal #personLocation").html(`Location: ${object.data.personnel[0].name}`);
	$("#personModal #contactInfo").html(`<a href="mailto:${object.data.personnel[0].email}" class="btn btn-add mt-3" id="cardEmail"><i class="fas fa-envelope"></i> ${object.data.personnel[0].email}</a>`);
	$("#personModal").modal('show');
}
// display edit modal
function editModal(type, id) {
	$("#editType").html(type).css("text-transform", "capitalize");
	$("#editId").html(id);

	switch (type){
		case "personnel":
			getPersonById(id, "edit");
			break;

		case "department":
			getDepartmentById(id);
			break;

		case "location":
			getLocationById(id);
			break;
	}

	$("#editModal").modal("show");
}
// display delete modal
function deleteModal(type, id) {
	$("#deleteType").html(type).css("text-transform", "capitalize");

	let content = ""
	switch (type){
		case "personnel":
			content = `<h6>Do you wish to delete record?</h6>
				<button id="deleteYes" class="btn btn-add">Yes</button>
				<button id="deleteNo" class="btn btn-danger" data-bs-dismiss="modal">No</button>`;
			break;

		case "department":
			content = `<h6>Do you wish to delete department?</h6>
				<button id="deleteYes" class="btn btn-add">Yes</button>
				<button id="deleteNo" class="btn btn-danger" data-bs-dismiss="modal">No</button>`;
			break;

		case "location":
			content = `<h6>Do you wish to delete location?</h6>
				<button type="button" id="deleteYes" class="btn btn-add">Yes</button>
				<button id="deleteNo" class="btn btn-danger" data-bs-dismiss="modal">No</button>`;
			break;
	}
	$("#deleteContent").html(content);
	$("#deleteId").html(id);
	$("#deleteModal").modal("show");
}
// display alert
function displayAlert(displayId, status, message){
	if(status != 200){
		$(`#${displayId}Alert`).html(`<div class="alert alert-dismissible alert-danger" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`);
	} 
}
// display toast
function displayToast(status, message) {
	if(status == 200) {
		$("#alertToast").html(`
		<div class="toast align-items-center show bg-success text-white bottom-0 end-0" role="alert" aria-live="assertive" aria-atomic="true">
			<div class="d-flex">
				<div class="toast-body">
					${message}
				</div>
				<button type="button" class="btn-close me-2 m-auto btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
		</div>`);
	}
}

// GET FUNCTIONS
// ajax call get all personnel information
function getAllPersonnel(val='') {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/all/getAll.php",
		"dataType": "json",
		"data": {
			"val": val,
		},

		success: function(results) {
			tableDisplay(results, "personnel");
			$('#countPersonnel').html(results['data'].length);
		},

        error: function() {
			console.log("Error occured getting all personnel records!");
		}
	});
}
// ajax call get all departments
function getAllDepartments(val='') {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/department/getAllDepartments.php",
		"dataType": "json",
		"data": {
			"val": val,
		},
		
		success: function(results) {
			tableDisplay(results, "department");
			$('#countDepartments').html(results['data'].length);
		},

        error: function() {
			console.log("Error occured getting all Departments!");
		}
	});
}
// ajax call get all Locations
function getAllLocations(val='') {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/Location/getAllLocations.php",
		"dataType": "json",
		"data": {
			"val": val,
		},
		
		success: function(results) {
			tableDisplay(results, "location");
			$('#countLocations').html(results['data'].length);
		},

        error: function(jqXHR) {
			console.log(jqXHR);
			console.log("Error occured getting all Locations!");
		}
	});
}
// get active element
function getType() {
	let type = $(".active");
	return type[1].id;
}
// get searched value
function searchVal(type) {
	if(type == "personnel") {
		getAllPersonnel($("#searchBar").val());
	} else if(type == "department") {
		getAllDepartments($("#searchBar").val());
	} else if(type == "location") { 
		getAllLocations($("#searchBar").val());
	};
}
// get filter departments
function getDepartmentsFilter(val='') {
	$.ajax({
		"async": false,
		"global": false,
		"url": "libs/php/department/getAllDepartments.php",
		"dataType": "json",
		"data": {
			"val": val,
		},
		success: function(results){
			displayCheckbox(results, "filterDepartment", "Departments");
		}, error: function(){
			console.log("error occured getting departments");
		}
	});
}
// get filter locations
function getLocationsFilter(val='') {
	$.ajax({
		"async": false,
		"global": false,
		"url": "libs/php/Location/getAllLocations.php",
		"dataType": "json",
		"data": {
			"val": val,
		},
		success: function(results){
			displayCheckbox(results, "filterLocation", "Locations");
		}, error: function(){
			console.log("error occured getting locations");
		}
	});
}
// filtered results
function getFilteredResults(departmentArray, locationArray) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"dataType": "json",
		"url": "libs/php/all/getFiltered.php",
		"data":{
			"departments": departmentArray,
			"locations": locationArray
		},
		success: function(results){
			tableDisplay(results, "personnel");
			$('#countPersonnel').html(results['data'].length);
		}, error: function(){
			console.log("Error occured getting filtered results");
		}
	});
}
// get checked filters and return results
function checkedFilters() {
	let filterDepartments = "";
	let filterLocations = "";
	let checked = $("input:checkbox:checked");

	for(let i = 0; i < checked.length; i++) {
		let id = checked[i].id;

		if(id.includes("Department")) {
			filterDepartments += `${checked[i].value},`;
		} else {
			filterLocations += `${checked[i].value},`;
		}	
	}

	filterDepartments = filterDepartments.replace(/.$/,"");	
	filterLocations = filterLocations.replace(/.$/,"");

	getFilteredResults(filterDepartments, filterLocations);

}
// get departments for modals
function getDepartments(selectedValue='', id) {
	let options;
	$.ajax({
		"async": false,
		"global": false,
		"url": "libs/php/department/getAllDepartments.php",
		"dataType": "json",
		"data": {
			"val": selectedValue,
		},

		success: function(results){
			options = displayOptions(results, id);
		}, error: function(){
			console.log("error occured getting departments");
		}
	});
	return options;
}
// get locations for modals
function getLocations(selectedValue='', id) {
	let options;
	$.ajax({
		"async": false,
		"global": false,
		"url": "libs/php/location/getAllLocations.php",
		"dataType": "json",
		"data": {
			"val": selectedValue,
		},

		success: function(results){
			options = displayOptions(results, id);
		}, error: function(){
			console.log("error occured getting Locations");
		}
	});
	return options;
}
// get location by department id
function getLocationByDepId(locId) {
	let location;
	$.ajax({
		"async": false,
		"global": false,
		"type": "POST",
		"url": "libs/php/location/getLocationByID.php",
		"dataType": "json",
		"data":{
			"departmentLocationId": locId,
		},
		success: function(results){
			location = displaySelectedLocation(results);
		}, error: function(){
			console.log("error getting location by id");
		}
	});
	return location;
}
// get person by id
function getPersonById(personId, type) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/personnel/getPersonnelById.php",
		"dataType": "json",
		"data": {
			"id": personId,
		},
		success: function(results) {
			if(type == "view") {
				console.log(results);
				viewModal(results);
			} else if(type == "edit") {
				$("#editForm").html(`
				<div class="row">
					<div class="form-group col-12 col-md-6">
						<label for="editFirst">First Name<span class="text-danger">*</span></label>
						<input type="text" id="editFirst" class="form-control form-required" value="${results.data.personnel[0].firstName}">
					</div>
					<div class="form-group col-12 col-md-6">
						<label for="editLast">Last Name<span class="text-danger">*</span></label>
						<input type="text" id="editLast" class="form-control form-required" value="${results.data.personnel[0].lastName}">
					</div>
				</div>
				<div class="form-group col-12">
					<label for="editJob">Job Title</label>
					<input type="text" id="editJob" class="form-control" value="${results.data.personnel[0].jobTitle}">
				</div>
				<div class="form-group col-12">
					<label for="editEmail">Email<span class="text-danger">*</span></label>
					<input type="email" id="editEmail" class="form-control form-required" value="${results.data.personnel[0].email}">
				</div>
				<div class="row">
					<div class="form-group col-12 col-md-6">
						<label for="editDep">Department<span class="text-danger">*</span></label>
						<select id="editDep" class="form-control form-required">
							${getDepartments('', results.data.personnel[0].departmentID)}
						</select>
					</div>
					<div class="form-group col-12 col-md-6">
						<label for="editLocation">Location<span class="text-danger">*</span></label>
						<select id="editLocation" class="form-control form-required" readonly disabled>
							${getLocations('', results.data.personnel[0].location)}
						</select>
					</div>
				</div>`);
			}
			
		}, error: function() {
			console.log("error getting personnel by id");
		}
	});
}
// get department by id
function getDepartmentById(depId) {
	$.ajax({
		"async": false,
		"global": false,
		"type": "POST",
		"url": "libs/php/department/getDepartmentById.php",
		"dataType": "json",
		"data":{
			"departmentId": depId,
		},
		success: function(results) {
			$("#editForm").html(`<div class="form-group">
				<label for="editDep">Department Name<span class="text-danger">*</span></label>
				<input type="text" id="editDep" class="form-control form-required" value="${results.data[0].name}">
			</div>
			<div class="form-group">
				<label for="editLocation">Department Location<span class="text-danger">*</span></label>
				<select id="editLocation" class="form-control form-required"">
					${getLocations()}
				</select>
			</div>`);
		}, error: function(){
			console.log("Error occured getting department by id!");
		}
	});
}
// get location by id
function getLocationById(locationId) {
	$.ajax({
		"async": false,
		"global": false,
		"type": "POST",
		"url": "libs/php/location/getLocationByID.php",
		"dataType": "json",
		"data":{
			"departmentLocationId": locationId,
		},
		success: function(results) {
			$("#editForm").html(`
				<div class="form-group">
					<label for="editLocation">Location Name<span class="text-danger">*</span></label>
					<input type="text" id="editLocation" class="form-control form-required" value="${results.data[0].name}">
				</div>`);
		}, error: function() {
			console.log("Error occured getting location by id!");
		}
	});
}

// CREATE FUNCTIONS
// create specific data input
function createData(type) {
	let addObj = {
		"first": $(`#firstName`).val(),
		"last": $(`#lastName`).val(),
		"title": $(`#addTitle`).val(),
		"email": $(`#newEmail`).val(),
		"department": $(`#addDepartment`).val(),
		"location": $(`#addLocation`).val(),
	}

	switch (type) {
		case "personnel":
			if (addObj.first != "" && addObj.last != "" && addObj.email != "" && addObj.department != ""){
				createPerson(addObj);
			}
			break;

		case "department":
			if (addObj.department != "" && addObj.location != ""){
				createDepartment(addObj);
			}
			break;
				
		case "location":
			if (addObj.location != ""){
				createLocation(addObj);
			}
			break;
	}
}
// create person data
function createPerson(addObj) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/personnel/insertPersonnel.php",
		"dataType": "json",
		"data": {
			"first": addObj.first,
			"last": addObj.last,
			"title": addObj.title,
			"email": addObj.email,
			"department": addObj.department,
		},
		success: function(results) {
			if(results.status.code != 200) {
				displayAlert("new",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllPersonnel();
				$("#newModal").modal("hide");
			}			
		}, error: function(){
			console.log("Create person data error occured");
		}
	});
}
// create department data
function createDepartment(addObj){
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/department/insertDepartment.php",
		"dataType": "json",
		"data": {
			"department": addObj.department,
			"location": addObj.location,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("new",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllDepartments();
				$("#newModal").modal("hide");
			}
		}, error: function(){
			console.log("Create department error occured");
		}
	});
}
// create location data
function createLocation(addObj){
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/location/insertLocation.php",
		"dataType": "json",
		"data": {
			"location": addObj.location,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("new",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllLocations();
				$("#newModal").modal("hide");
			}
		}, error: function(){
			console.log("Error creating new location!");
		}
	});
}

// UPDATE FUNCTIONS
// update specific data input
function updateData(type, editId) {
	let editObj = {
		"first": $(`#editFirst`).val(),
		"last": $(`#editLast`).val(),
		"title": $(`#editJob`).val(),
		"email": $(`#editEmail`).val(),
		"department": $(`#editDep`).val(),
		"location": $(`#editLocation`).val(),
	}

	switch (type) {
		case "personnel":
			if (editObj.first != "" && editObj.last != "" && editObj.email != "" && editObj.department != "") {
				updatePersonnel(editObj, editId);
			}
			break;

		case "department":
			if (editObj.department != "" && editObj.location != "") {
				updateDepartment(editObj, editId);
			}
			break;
		
		case "location":
			if (editObj.location != "") {
				updateLocation(editObj, editId);
			}
			break;
	}
}
// update person data
function updatePersonnel(editObj, id) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/personnel/updatePersonnel.php",
		"dataType": "json",
		"data": {
			"id": id,
			"first": editObj.first,
			"last": editObj.last,
			"title": editObj.title,
			"email": editObj.email,
			"department": editObj.department
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("edit",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllPersonnel();
				$("#editModal").modal("hide");
			}
		}, error: function(){
			console.log("Error occured updating personnel data!");
		}
	});
}
// update department data
function updateDepartment(editObj, id){
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/department/updateDepartment.php",
		"dataType": "json",
		"data": {
			"departmentId": id,
			"department": editObj.department,
			"location": editObj.location,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("edit",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllDepartments();
				$("#editModal").modal("hide");
			}
			
		}, error: function(){
			console.log("Error occured updating department!");
		}
	});
}
// update location data
function updateLocation(editObj, id){
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/location/updateLocation.php",
		"dataType": "json",
		"data": {
			"locationId": id,
			"location": editObj.location,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("edit",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllLocations();
				$("#editModal").modal("hide");
			}
		}, error: function(){
			console.log("Error occured editting location!");
		}
	});
}

// DELETE FUNCTIONS
// delete specific data input
function deleteData(type, id) {
	switch (type){
		case "personnel":
			if (id != ""){
				deletePerson(id);
			}
			break;

		case "department":
			if (id != ""){
				deleteDepartment(id);
			}
			break;
				
		case "location":
			if (id != ""){
				deleteLocation(id);
			}
			break;
	}
}
// delete person data
function deletePerson(id) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/personnel/deletePersonnelById.php",
		"dataType": "json",
		"data": {
			"id": id,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("delete",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllPersonnel();
				$("#deleteModal").modal("hide");
			}
			
		}, error: function(){
			console.log("Error occured deleting personnel data!");
		}
	});
}
// delete deptartment
function deleteDepartment(id) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/department/deleteDepartmentById.php",
		"dataType": "json",
		"data": {
			"id": id,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("delete",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				getAllDepartments();
				$("#deleteModal").modal("hide");
			}
			
		}, error: function(){
			console.log("Error occured deleting department!");
		}
	});
}
// delete location
function deleteLocation(id) {
	$.ajax({
		"async": true,
		"global": false,
		"type": "POST",
		"url": "libs/php/location/deleteLocationById.php",
		"dataType": "json",
		"data": {
			"id": id,
		},
		success: function(results){
			if(results.status.code != 200) {
				displayAlert("delete",results.status.code, results.status.description);
			} else {
				displayToast(results.status.code, results.status.description);
				$("#deleteModal").modal("hide");
				getAllLocations();
			}
			
			
		}, error: function(){
			console.log("Error occured deleting location!");
		}
	});
}

// FORM VALIDATION FUNCTIONS
// validate form inputs
function validateInputs(formId) {
	resetForm(formId);

	let inputs = $(`#${formId}Form .form-required`);
	
	for (const [key, obj] of Object.entries(inputs)) {
		if (obj.value == ""){
			$(`#${obj.id}`).addClass("border-danger").siblings().append('<span class="text-danger form-response"> Field Required!</span>');
		}
	}

	if ($(`#${formId}Form .form-response`).length > 0){
		displayToast(400, "Form Invalid!");
	};
}
// Reset form validation
function resetForm(formId) {
	$(`#${formId}Form .form-response`).remove();
	$(`#${formId}Form .form-required`).removeClass("border-danger");
	$(`#${formId}Alert .alert`).remove();
}

// DOCUMENT READY
$(document).ready(function() {
    // Load info
    getAllPersonnel();

    // Display tabs
    $('#personnelTab').on('click', function() {
		resetForm("new");
		resetForm("edit");
		resetForm("delete");

		getAllPersonnel();
		$('#searchBar').attr('placeholder', 'Search Name');
	});

	$('#departmentTab').on('click', function() {
		resetForm("new");
		resetForm("edit");
		resetForm("delete");

		getAllDepartments();
		$('#searchBar').attr('placeholder', 'Search Department');
	});

	$('#locationTab').on('click', function() {
		resetForm("new");
		resetForm("edit");
		resetForm("delete");

		getAllLocations();
		$('#searchBar').attr('placeholder', 'Search Location');
	});

	// Search bar
	$('#searchBtn').on('click', function() {
		searchVal(getType());
	});

	// Refresh btn
	$('#refreshBtn').on('click', function() {
		getAllPersonnel();
		getAllDepartments();
		getAllLocations();
	});

	// Filter btn
	$('#filterBtn').on('click', function() {
		getDepartmentsFilter();
		getLocationsFilter();
	});
	$('#filterApplyBtn').on('click', function() {
		checkedFilters();
		$('#filterModal').modal('hide');
	});

	// Add btns
	$('#newPersonBtn').on('click', function() {
		newModal("personnel");
	});
	$('#newDepBtn').on('click', function() {
		newModal("department");
	});
	$('#newLocBtn').on('click', function() {
		newModal("location");
	});
	$(document).on('change', '#newForm #addDepartment', function() {
		let locId = $('#addDepartment').val().split(',')[1]; 
		$('#addLocation').html(getLocationByDepId(locId));
	});
	$("#newSubmitBtn").click(function() {
		validateInputs("new");
		createData(getType());
	});
	// Person view btn
	$(document).on("click", "tbody tr #personViewBtn", function() {
		let id = $(this).parent().parent().siblings().html();
		getPersonById(id, "view");
	});
	// edit btns
	$(document).on("click", "tbody tr #editBtn", function() {
		let id = $(this).parent().parent().siblings().html();
		editModal(getType(), id);
	});
	$(document).on('change', '#editForm #editDep', function() {
		let locId = $('#editDep').val().split(',')[1];
		$('#editLocation').html(getLocationByDepId(locId));
	});
	$(document).on("click", "#editSubmitBtn", function() {
		let id = $("#editId").html();
		validateInputs("edit");
		updateData(getType(), id);
	});
	// delete btns
	$(document).on("click", "tbody tr #deleteBtn", function() {
		let id = $(this).parent().parent().siblings().html();
		deleteModal(getType(), id);
	});
	$(document).on("click", "#deleteYes", function() {
		let id = $("#deleteId").html();
		deleteData(getType(), id);
	});
	
});
