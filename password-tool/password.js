var select = window.document.getElementById("select");
var ck1 = window.document.getElementById("ck1");
var ck2 = window.document.getElementById("ck2");
var ck3 = window.document.getElementById("ck3");
var ck4 = window.document.getElementById("ck4");
var ck5 = window.document.getElementById("ck5");
var ck6 = window.document.getElementById("ck6");
var ck7 = window.document.getElementById("ck7");
var btn = window.document.getElementById("btn");
var box = window.document.getElementById("box");
var showText = document.getElementById("ptext");

var simboles = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+"];
var other = ["~", "`", "[", "]", ";", "?"];
var capital = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var num = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

//pass to select box
for (var i = 6; i <= 25; i++) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    select.appendChild(opt);
}

var simple = [];
for (var j = 0; j < capital.length; j++) { simple[j] = capital[j].toLowerCase() }
var customArr = [...num, ...simple, ...simboles, ...other, ...capital];
var newArr = [];

//genrate password
btn.addEventListener("click", function () {
    box.value = ""; newArr = [];
    var password = "", p1 = "", p2 = "", p3 = "", p4 = "", p5 = "", p6 = "", p7 = "", sim = "", len = 6;
    function generate(array, siz) {
        var pass = [];
        for (let i = 0; i < siz; i++) {
            pass.push(array[Math.floor(Math.random() * (array.length + 1))]);
        }
        return pass.join("");
    }

    if (select.options[select.selectedIndex].value != null && select.options[select.selectedIndex].value != undefined) {
        len = select.options[select.selectedIndex].value
    }

    if (ck1.checked) {
        newArr = [...newArr, ...simboles];
    }
    if (ck2.checked) {
        newArr = [...newArr, ...num];
    }
    if (ck3.checked) {
        newArr = [...newArr, ...simple];
    }
    if (ck4.checked) {
        newArr = [...newArr, ...capital];
    }

    if (ck7.checked) {
        newArr = [...newArr, ...other];
    }

    if (ck6.checked) {
        newArr = customArr;
    }

    password = generate(newArr, len);

    if (ck5.checked) {
        var dub = [];
        var index = Math.floor(Math.random() * ([...password].length + 1))
        dub = [...password];
        dub[index + 1] = [...password][index];
        password = dub.join("");
    }


    //box.value = generate(simboles, len);
    //box.value = generate(abc, len);
    //box.value = generate(abc, len).toLowerCase();
    //box.value = generate(num, len);
    //box.value = generate(other, len);

    if (password) {
        showText.innerHTML = "Copy : " + password;
    }

    box.value = password;
    newArr = [];
    password = "";
}, false);

showText.addEventListener('click', function () {
    function copyFunction() {
        var copyData = document.getElementById("box");
        var showText = document.getElementById("ptext");
        copyData.select();
        navigator.clipboard.writeText(copyData.value);
        showText.innerHTML = "Copied ✔️ " + "(" + copyData.value + ")";
    }

    if (document.getElementById("box").value) {
        copyFunction();
    }

}, false);






