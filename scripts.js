// load navbar in each page
$(document).ready(function () {
    $("#title").load("title.html");
    $("#navbar").load("navbar.html");
});

// load navbar in each page
$(document).ready(function () {
    $("#footer").load("footer.html");
});

// determine the current page and set "active" menu item
function activeItem() {
    var links = document.getElementsByClassName("pageURL");
    var URL = window.location.pathname;
    URL = URL.substring(URL.lastIndexOf('/'));
    for (var i = 0; i < links.length; i++) {
        if (links[i].dataset.pathname == URL) {
            links[i].classList.add("active");
        }
    }
}


/* ************** evolveini.html buttons ************** */
// button script - reload page
$(document).ready(function () {
    $("#resetBtn").click(function () {
        document.forms[0].reset();
        location.reload();

    });
});

// button script - generate ini file
$(document).ready(function () {
    $("#submitBtn").click(function () {
        generateIniFile();

    });
});

/* ************** evolveini.html generate file ************** */
// generate evolve.ini file using Form Data
function generateIniFile() {
    var formData = $("#configForm").serializeArray();
    var fileContent = "[defaults]\n";
    console.log(formData);

    // Define an array of headers and their corresponding form field names
    var headers = [
        {
            name: "activate_fetchcore",
            header: "[fetchcore]\r\n"
        },
        {
            name: "activate_linde_serial_port",
            header: "[linde_serial_port]\r\n"
        },
        {
            name: "activate_honeywell",
            header: "[honeywell]\r\n"
        },
        {
            name: "activate_hanshow",
            header: "[hanshow]\r\n"
        },
        {
            name: "activate_nextthing",
            header: "[nextthing]\r\n"
        }
    ];

    for (var i = 0; i < formData.length; i++) {

        for (var j = 0; j < headers.length; j++) {
            if (formData[i].name === headers[j].name && formData[i].value === "1") {
                fileContent += headers[j].header;
                console.log(headers[j].header.trim());
                headerAdded = true;
                break;
            }
        }

        // remove activate_* from remaining items
        if (formData[i].name.includes("activate_")) {
            continue;
        }

        // If form field value is empty, continue without creating line in file
        if (formData[i].value === "") {
            continue;

            // If form field value contains data, create line in file
        } else {
            fileContent += formData[i].name + " = " + formData[i].value + "\r\n";
        }

    }

    // create file contents from form data and headers
    var blob = new Blob([fileContent], {
        type: "text/plain"
    });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "evolve.ini";
    link.click();
    URL.revokeObjectURL(link.href);
    console.log(fileContent);
}

/* ************** evolveini.html clear data from select fields ************** */
// function to toggle optional configuration elements and clear data when deselected - .activate class elements
$(function () {
    $(".activate").click(function () {
        var wrapperId = $(this).data("wrapper");
        var $wrapper = $("#" + wrapperId);

        $wrapper.toggle();
        $wrapper.find("input:hidden").each(function () {
            $(this).data($(this).attr("name"), $(this).val(""));
        });
        $wrapper.find("select").each(function () {
            $(this).val($(this).find("option:first").val());
        });
    });
});

/* ************** evolveini.html clear/check/unhide form data ************** */
// function to clear the entire form before importing the dropped file data.
// as well as calls functions to activate all the check-boxes and unhides all hidden form data


function clearForm() {
    
    document.forms[0].reset();
    console.log("form reset");
    

    /* // Clear text inputs and other fields
    $('#configForm input[type="text"], #configForm input[type="number"], #configForm textarea').val('');
    console.log("clearing form");

    // Uncheck all checkboxes and radio buttons
    $('#configForm input[type="checkbox"], #configForm input[type="radio"]').prop('checked', false);
    console.log("uncheck boxes");

    // Reset select elements to their first option
    $('#configForm select').each(function() {
        $(this).val($(this).find('option:first').val());
    });
    console.log("reset select elements");

    // Call additional functions to reset other form elements
    //unhideHiddenElements();
    //activateCheckboxes();*/
}

/*
function clearForm() {

    $('#configForm input').val('');
    activateCheckboxes();
    unhideHiddenElements();

}
*/

function unhideHiddenElements() {
    // Select all hidden elements within the form using jQuery
    var hiddenElements = $('form :hidden');

    // Show the hidden elements
    hiddenElements.show();
}

function activateCheckboxes() {
    // Select all checkboxes with the class "activate"
    var checkboxes = $('.activate:checkbox');

    // Loop through each checkbox and set its "checked" property to true
    checkboxes.prop('checked', true).val(1);

    // Trigger a change event on each checkbox to update their visual appearance
    checkboxes.trigger('change');
}

/* ************** evolveini.html drop file ************** */
// function to handle dropped file and exceptions
$(document).ready(function () {
    var dropBox = $('#dropBox');
    var configForm = $('#configForm');
    var fileInput = $('#fileInput');

    dropBoxSetup(dropBox, configForm);

    // Function to prevent default behavior when files are dragged over the drop box
    function dropBoxSetup(dropBox, configForm) {
        dropBox.on('dragover', function (e) {
            e.preventDefault();
            dropBox.css('background-color', '#9bd1a9');
        });

        dropBox.on('dragleave', function (e) {
            e.preventDefault();
            dropBox.css('background-color', 'white');
        });

        dropBox.on('drop', function (e) {
            e.preventDefault();
            dropBox.css('background-color', 'white');
            handleDroppedFiles(e, configForm);
        });
    }

    // Function to handle dropped files
    function handleDroppedFiles(e, configForm) {
        clearForm();

        var files = e.originalEvent.dataTransfer.files;
        var file = files[0]; // Assuming only one file is dropped

        if (file.name.toLowerCase().endsWith('.ini')) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var contents = event.target.result;
                populateForm(contents, configForm);
                console.log('read file!');
                unhideHiddenElements();
                activateCheckboxes();
            };
            reader.readAsText(file);
        } else {
            alert('Please drop a .ini file.');
        }
    }

    // Add click event listener for file upload on click
    dropBox.on('click', function () {

        clearForm();
        fileInput.click(); // Trigger click event on the file input
    });

    // Add change event listener to the file upload
    fileInput.on('change', function (e) {
        var selectedFile = e.target.files[0];
        console.log("step 1");
        if (selectedFile) {
            var reader = new FileReader();
            console.log("step 2");
            reader.onload = function (event) {
                console.log("step 3");
                var contents = event.target.result;
                console.log("step 4");
                populateForm(contents, configForm);
                console.log("step 5");
                console.log('read file!');
                unhideHiddenElements();
                activateCheckboxes();
            };
            reader.readAsText(selectedFile);
        }
        fileInput.val(''); // Reset the file input value
    });

    // Function to parse the file content and populate the form
    function populateForm(contents, configForm) {
        var lines = contents.split('\n');
        var currentHeader = '';

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();

            if (line.startsWith('[') && line.endsWith(']')) {
                currentHeader = line.substring(1, line.length - 1);
                continue;
            }

if (line.startsWith('#') || line.startsWith(';')) {
                continue;
            } else if (line !== '') {
                var parts = line.split(/[=]/);
                var fieldName = parts[0].trim();
                var fieldValue = parts[1].trim();

                var inputElement = configForm.find('[name="' + fieldName + '"]');
                if (inputElement.length > 0) {
                    inputElement.val(fieldValue);
                }

            }
        }
    }

});

function convertToUnicode() {
    var inputText = document.getElementById("inputText").value;
    var unicodeOutput = " [uni ";
    for (var i = 0; i < inputText.length; i++) {
        var hexValue = inputText.charCodeAt(i).toString(16).toUpperCase();
        while (hexValue.length <
            4) {
            hexValue = "0" + hexValue;
        }
        unicodeOutput += hexValue;
    }
    unicodeOutput += "]";
    document.getElementById("unicodeOutput").textContent = unicodeOutput;
    //Enable the copy button 
    document.getElementById("copyButton").disabled = false;
}

function copyToClipboard() {
    var outputText = document.getElementById("unicodeOutput");
    var range = document.createRange();
    range.selectNode(outputText);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
}


// function for colour picker
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.color-picker').forEach(function (picker) {
        // Listen for 'input' events instead of 'change'
        picker.addEventListener('input', function () {
            var targetSelector = this.getAttribute('data-target');
            var targetInput = document.querySelector(targetSelector);
            if (targetInput) {
                targetInput.value = this.value.replace('#', '');
            }
        });
    });
});
