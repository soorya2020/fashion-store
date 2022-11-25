





function addToCart(prodId,stock){
  

  
    

    $.ajax({
        
        url:'/add-to-cart/'+prodId,
        method:'get',
        success:(response)=>{
            if(response.status){
                if(stock-response.quantity<=0){
                    Swal.fire('Any fool can use a computer')
                }else{
                    let count=$('#cart-count').html()
                    count=parseInt(count)+1
                    $('#cart-count').html(count)
                }
            }
        }
    })
}
   


async function toast() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-right',
        iconColor: 'white',
        customClass: {
          popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
      await Toast.fire({
        icon: 'success',
        title: 'Item added'
      })
      
}

