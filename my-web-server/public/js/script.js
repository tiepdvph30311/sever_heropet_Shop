$(document).ready(function() {
    // Lấy danh sách sản phẩm từ server
    $.get("/api/products", function(data) {
      const productList = $("#product-list");
      productList.empty(); // Xóa nội dung cũ
  
      // Kiểm tra xem có sản phẩm nào không
      if (data) {
        Object.keys(data).forEach(productId => {
          const product = data[productId];
          
          // Tạo card hiển thị sản phẩm
          const productCard = `
            <div class="col-md-4">
              <div class="card product-card">
                <img src="${product.hinhanh}" class="card-img-top" alt="${product.giatien}">
                <div class="card-body">
                  <h5 class="card-title">${product.giatien} VNĐ</h5>
                  <p class="card-text">Hạn sử dụng: ${product.hansudung}</p>
                  <a href="#" class="btn btn-primary">Mua ngay</a>
                </div>
              </div>
            </div>
          `;
  
          productList.append(productCard);
        });
      } else {
        productList.append('<p>Không có sản phẩm nào</p>');
      }
    });
  });
  