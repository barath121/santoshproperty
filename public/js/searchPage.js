function pages(page){
    window.location.href = location.href+"&"+"page="+page;
}
function sale(){
    if(document.getElementById("sale").classList.contains("d-none")){
        document.getElementById("sale").classList.remove("d-none")
    }
    else if(!document.getElementById("sale").classList.contains("d-none")){
        document.getElementById("sale").classList.add("d-none")
    }
}
function rent(){
    if(!document.getElementById("sale").classList.contains("d-none")){
        document.getElementById("sale").classList.add("d-none")
    }
}