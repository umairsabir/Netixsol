let btn = document.querySelector('#b-m');
let notification = document.querySelectorAll('.noti')
let num = document.querySelector('#num-h');
let iconElement = document.querySelectorAll('.icon')

btn.addEventListener('click', () => {
    num.innerHTML = "0";
    notification.forEach((item) => {
        item.style.backgroundColor = "#dbeafe";
    })
    iconElement.forEach((item) => {
        item.classList.remove("bg-red-500");
    })
})
notification.forEach((item , index) => {
    item.addEventListener('click', () => {
        if (!item.classList.contains("read")) {
            let count = parseInt(num.innerHTML);
            if (count > 0) {
                num.innerHTML = count - 1;
            }

            item.classList.add("read");
            item.style.backgroundColor = "#dbeafe";
            let a =item.querySelectorAll('span')
            a.forEach((item)=>{
                if(item.getElementsByClassName('icon')){
                    item.style.background ="none";
                }
            })
            
            
            
            
        }
    });
});
