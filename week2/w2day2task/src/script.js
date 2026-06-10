
const btn = document.getElementById("btn");
let inputL = document.querySelectorAll(".inputlable")
let fieldclass = document.querySelectorAll(".inputclass")
console.log(fieldclass)
fieldclass.forEach((item)=>{
    item.addEventListener("click" , ()=>{
        inputL.forEach((item)=>{
            item.style.color = '#6B7280';
        })
        fieldclass.forEach((item)=>{
            item.style.borderColor ='#D1D5DB';
        })

    })
})
btn.addEventListener("click", () => {
    const day = parseInt(document.getElementById("day").value);
    const month = parseInt(document.getElementById("month").value);
    const year = parseInt(document.getElementById("year").value);
    if (!day || !month || !year) {
        inputL.forEach((item)=>{
            item.style.color = 'red';  
        })
        fieldclass.forEach((item)=>{
            item.style.borderColor ='red';
        })
        return;
    }
    
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);

    if (birthDate > today) {
        alert("Invalid data");
        return;
    }

    let y = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    let d = today.getDate() - birthDate.getDate();
    console.log(y)

    if (d < 0) {
        m--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        d += prevMonth.getDate();
    }

    if (m < 0) {
        y--;
        m += 12;
    }

    animateValue("years", y);
    animateValue("months", m);
    animateValue("days", d);
});


// 🔥 Animation Function (BONUS)
function animateValue(id, end) {
    let start = 0;
    const duration = 500;
    const stepTime = Math.abs(Math.floor(duration / end));

    const obj = document.getElementById(id);

    const timer = setInterval(() => {
        start++;
        obj.textContent = start;
        if (start >= end) {
            clearInterval(timer);
            obj.textContent = end;
        }
    }, stepTime || 50);
}
