var socket = io();

socket.on('contact-count', function(rsp) {
	$("#contact_count").html(rsp.count);
});

$(document).on('click', '#home', function() {
	$.ajax({
		url: "/home",
		success: function(rsp) {
			$('#main').html(rsp.html);
		}
	});
});

$(document).on('click', '#add', function() {
	clearQRCode();
	clearSearch();
	$.ajax({
		url: "/addContactForm",
		success: function(rsp) {
			$('#main').html(rsp);
			$('#first_name').focus();
			validateContactForm("#addContactForm");			
		}
	});
});

$(document).on('click', '#modify', function() {
	$.ajax({
		url: "/modifyMobileForm",
		success: function(rsp) {
			$('#main').html(rsp);
			$("#mobile").focus();
			clearQRCode();
			clearSearch();
			validateMobileForm("#modifyMobileForm");			
		}
	});
});

$(document).on('click', '#delete', function() {
	$.ajax({
		url: "/deleteMobileForm",
		success: function(rsp) {
			$('#main').html(rsp);
			$("#mobile").focus();
			clearQRCode();
			clearSearch();
			validateMobileForm("#deleteMobileForm");			
		}
	});
});

$(document).on('click', '#display', function() {
	$.ajax({
		url: "/display",
		success: function(rsp) {
			$('#main').html(rsp.html);
			clearQRCode();
			clearSearch();
			var table = $('#display_table').DataTable();
			table.on('order.dt search.dt', function () {
				table.column(0, {search:'applied', order:'applied'}).nodes().each(function (cell, i) {
					cell.innerHTML = i + 1;
				});
			}).draw();
		}
	});
});

$(document).on('click', '#browse', function() {
	event.preventDefault();
	$.ajax({
		url: "/browse",
		success: function(rsp) {
			if (rsp.contacts == null || rsp.contacts.length == 0)
				return;

			$('#main').html(rsp.html);

			var curr = 0;
			prefillContact("#browseContactForm", rsp.contacts[curr]);

			// remove previous listeners
			$(document).off('click', '#browseNext');
			$(document).off('click', '#browsePrevious');

			$('#browsePrevious').prop('disabled', true);
			if (rsp.contacts.length == 1)
				$('#browseNext').prop('disabled', true);
			else
				$('#browseNext').prop('disabled', false);

			$("#pagecount").text(curr + 1);
			$(document).on('click', '#browseNext', function(event) {
				event.preventDefault();
				if (++curr < rsp.contacts.length)
				{
					prefillContact("#browseContactForm", rsp.contacts[curr]);
					$('#browsePrevious').prop('disabled', false);
					$("#pagecount").text(curr + 1);
				}

				if (curr >= rsp.contacts.length - 1)
					$('#browseNext').prop('disabled', true);
			});

			$(document).on('click', '#browsePrevious', function(event) {
				event.preventDefault();
				if (--curr >= 0)
				{
					prefillContact("#browseContactForm", rsp.contacts[curr]);
					$('#browseNext').prop('disabled', false);
					$("#pagecount").text(curr + 1);
				}

				if (curr <= 0)
					$('#browsePrevious').prop('disabled', true);

			});
		}
	});
});

function prefillContact(formid, ct, pattern)
{
	$(formid + ' :input[name=first_name]').val(ct.first_name);
	$(formid + ' :input[name=last_name]').val(ct.last_name);
	$(formid + ' :input[name=address]').val(ct.address);
	$(formid + ' :input[name=city]').val(ct.city);
	$(formid + ' :input[name=state]').val(ct.state);
	$(formid + ' :input[name=zip]').val(ct.zip);
	$(formid + ' :input[name=mobile]').val(ct.mobile);
	$(formid + ' #state').val(ct.state).change();

	$(formid + ' :input').prop("readonly", true);
	$(formid + ' #state').prop("disabled", true);

	var qr = kjua({render: 'canvas', size: 256, text: JSON.stringify(ct, null, 4)});
	addQRCode(qr);
}

$(document).on('click', '#searchImg', function() {
	event.preventDefault();

	var pattern = formToJSON('#searchForm').pattern;
	if (pattern == null || pattern.length == 0)
		return;

	$.ajax({
		url: "/search?pattern=" + pattern,
		success: function(rsp) {
			if (rsp.contacts == null || rsp.contacts.length == 0)
				return;

			$('#main').html(rsp.html);

			var curr = 0;
			prefillContact("#browseContactForm", rsp.contacts[curr]);
			$("#pagecount").text(curr + 1);

			// remove previous listeners
			$(document).off('click', '#browseNext');
			$(document).off('click', '#browsePrevious');

			$('#browsePrevious').prop('disabled', true);
			if (rsp.contacts.length == 1)
				$('#browseNext').prop('disabled', true);
			else
				$('#browseNext').prop('disabled', false);

			$(document).on('click', '#browseNext', function(event) {
				event.preventDefault();
				if (++curr < rsp.contacts.length)
				{
					prefillContact("#browseContactForm", rsp.contacts[curr]);
					$('#browsePrevious').prop('disabled', false);
					$("#pagecount").text(curr + 1);
				}

				if (curr >= rsp.contacts.length - 1)
					$('#browseNext').prop('disabled', true);
			});

			$(document).on('click', '#browsePrevious', function(event) {
				event.preventDefault();
				if (--curr >= 0)
				{
					prefillContact("#browseContactForm", rsp.contacts[curr]);
					$('#browseNext').prop('disabled', false);
					$("#pagecount").text(curr + 1);
				}

				if (curr <= 0)
					$('#browsePrevious').prop('disabled', true);
			});
		}
	});
});

$(document).on('click', '#modifyMobileSubmit', function() {
	event.preventDefault();

	if (! $('#modifyMobileForm').valid())
		return;

	var mobile = formToJSON('#modifyMobileForm').mobile;
	$.ajax({
		url: "/modifyContactForm?mobile=" + mobile,
		success: function(rsp) {
			if (rsp.status == "OK")
			{
				$('#main').html(rsp.html);
				$('#modifyContactForm select[name=state]').val(rsp.contact.state).change();
				$('#modifyContactForm input[name=mobile]').prop("readonly", true);
				var qr = kjua({render: 'canvas', size: 256, text: JSON.stringify(rsp.contact, null, 4)});
				addQRCode(qr);
				validateContactForm("#modifyContactForm");			
			}
			else
				alert(rsp.message);
		}
	});
});

$(document).on('click', '#deleteMobileSubmit', function() {
	event.preventDefault();

	if (! $('#deleteMobileForm').valid())
		return;

	var mobile = formToJSON('#deleteMobileForm').mobile;
	$.ajax({
		url: "/deleteContactForm?mobile=" + mobile,
		success: function(rsp) {
			if (rsp.status == "OK")
			{
				$('#main').html(rsp.html);
				$('#deleteContactForm select[name=state]').val(rsp.contact.state).change();
				$('#deleteContactForm :input').prop("readonly", true);
				$('#state').prop("disabled", true);
				var qr = kjua({render: 'canvas',  size: 256, text: JSON.stringify(rsp.contact, null, 4)});
				addQRCode(qr);
			}
			else
				alert(rsp.message);
		}
	});
});

$(document).on('click', '#addSubmit', function(event) {
	event.preventDefault();

	if (! $('#addContactForm').valid())
		return;

	$.ajax({
        type: 'POST',
		url: '/addContact',
        contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(formToJSON('#addContactForm')),
		dataType: 'json',
		success: function(rsp) {
			$('#addSubmit').prop('disabled', true);
			alert(rsp.message);
		},
		error: function(jqXjr, textStatus, errmsg) {
			alert(textStatus + ", " + errmsg);
		},
	});
});

$(document).on('click', '#modifySubmit', function(event) {
	event.preventDefault();

	if (! $('#modifyContactForm').valid())
		return;

	$.ajax({
        type: 'PUT',
		url: '/modifyContact',
        contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(formToJSON('#modifyContactForm')),
		dataType: 'json',
		success: function(rsp) {
			$('#modifySubmit').prop('disabled', true);
			alert(rsp.message);
		},
		error: function(jqXjr, textStatus, errmsg) {
			alert(textStatus + ", " + errmsg);
		},
	});
});

$(document).on('click', '#deleteSubmit', function(event) {
	event.preventDefault();
	$.ajax({
        type: 'DELETE',
		url: '/deleteContact',
        contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(formToJSON('#deleteContactForm')),
		dataType: 'json',
		success: function(rsp) {
			$('#deleteSubmit').prop('disabled', true);
			alert(rsp.message);
		},
		error: function(jqXjr, textStatus, errmsg) {
			alert(textStatus + ", " + errmsg);
		},
	});
});

function formToJSON(formid)
{
 	var form = $(formid).serializeArray();
	var json = {};
	for (var i = 0; i < form.length; i++)
	{
		if (form[i].value != null)
			json[form[i].name] = form[i].value.trim();
		else
			json[form[i].name] = form[i].value;
	}

	return json;
}

function validateContactForm(formid)
{
	$(formid).validate({
		rules: {
			first_name: {
				required: true,
				minlength: 1,
			},
			last_name: {
				required: true,
				minlength: 2,
			},
			city: {
				required: true,
			},
			state: {
				required: true,
			},
			address: {
				required: true,
			},
			zip: {
				required: true,
				minlength: 6,
				maxlength: 6,
				digits: true,
			},
			mobile: {
				required: true,
				minlength: 10,
				maxlength: 10,
				digits: true,
			},
		},
		messages: {
			first_name: {
				required: "Please specify first_name",
				minlength: "Please specify atleast 1 char",
			},
			last_name: {
				required: "Please specify last_name",
				minlength: "Please specify atleast 2 chars",
			},
			address: {
				required: "Please specify address",
			},
			city: {
				required: "Please specify city",
			},
			state: {
				required: "Please select a state",
			},
			zip: {
				required: "Please specify zip",
				digits: "Please specify digits only",
				minlength: "Please specify atleast 6 digits",
				maxlength: "Please specify 6 digits only",
			},
			mobile: {
				required: "Please specify mobile number",
				digits: "Please specify digits only",
				minlength: "Please specify 10 digits",
				maxlength: "Please specify 10 digits only",
			},
		},
	});
}

function validateMobileForm(formid)
{
	$(formid).validate({
		rules: {
			mobile: {
				required: true,
				minlength: 10,
				maxlength: 10,
				digits: true,
			},
		},
		messages: {
			mobile: {
				required: "Please specify mobile number",
				digits: "Please specify digits only",
				minlength: "Please specify 10 digits",
				maxlength: "Please specify 10 digits only",
			},
		},
	});
}

function addQRCode(qrc)
{
	$('#qrcode').html(qrc);
	$('#qrcode').addClass("qrcode");
}

function clearQRCode()
{
	$('#qrcode').html("");
	$('#qrcode').removeClass("qrcode");
	$('#pagecount').text("");
}

function clearSearch()
{
	$('#pattern').val("");
}

$("#home").trigger("click");
