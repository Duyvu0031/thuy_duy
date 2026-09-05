document.addEventListener("DOMContentLoaded", async () => {

    // ========================================
    // SUPABASE
    // ========================================

    const SUPABASE_URL =
        "https://jydcsmapxqjworpqwepq.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";

    const supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


    // ========================================
    // PAYMENT CONFIG
    // ========================================

    // TẠM THỜI ĐIỀN THÔNG TIN NGÂN HÀNG CỦA M
    // Sau khi m đưa ngân hàng + STK cho t,
    // t sẽ cấu hình chính xác cho m.

    const PAYMENT = {

        bankId: "9376080031",

        bankName: "VietComBank",

        accountNumber: "9376080031",

        accountName: "NGUYEN VU TUNG DUY"

    };


    // ========================================
    // GET PRODUCT ID
    // ========================================

    const params =
        new URLSearchParams(window.location.search);

    const productId =
        params.get("id");


    if (!productId) {

        document.getElementById("productName").textContent =
            "KHÔNG TÌM THẤY SẢN PHẨM";

        return;

    }


    // ========================================
    // ELEMENTS
    // ========================================

    const productImage =
        document.getElementById("productImage");

    const productName =
        document.getElementById("productName");

    const productCategory =
        document.getElementById("productCategory");

    const productPrice =
        document.getElementById("productPrice");

    const productDescription =
        document.getElementById("productDescription");

    const productMaterial =
        document.getElementById("productMaterial");

    const productWeight =
        document.getElementById("productWeight");

    const productPrintTime =
        document.getElementById("productPrintTime");

    const productPrinter =
        document.getElementById("productPrinter");

    const productSize =
        document.getElementById("productSize");

    const productInfill =
        document.getElementById("productInfill");

    const productSupport =
        document.getElementById("productSupport");

    const productColors =
        document.getElementById("productColors");

    const productTags =
        document.getElementById("productTags");

    const orderButton =
        document.getElementById("orderButton");


    // ========================================
    // PAYMENT ELEMENTS
    // ========================================

    const paymentModal =
        document.getElementById("paymentModal");

    const paymentClose =
        document.getElementById("paymentClose");

    const paymentQR =
        document.getElementById("paymentQR");

    const paymentProductName =
        document.getElementById("paymentProductName");

    const paymentAmount =
        document.getElementById("paymentAmount");

    const bankName =
        document.getElementById("bankName");

    const bankAccount =
        document.getElementById("bankAccount");

    const bankOwner =
        document.getElementById("bankOwner");


    let currentProduct = null;


    // ========================================
    // FORMAT MONEY
    // ========================================

    function formatMoney(value) {

        return Number(value || 0)
            .toLocaleString("vi-VN") + " VNĐ";

    }


    // ========================================
    // CATEGORY
    // ========================================

    function getCategoryName(category) {

        const categories = {

            "moc-khoa": "Móc khóa",

            "gia-dung": "Đồ gia dụng",

            "trang-tri": "Trang trí",

            "mo-hinh": "Mô hình",

            "phu-kien": "Phụ kiện"

        };

        return categories[category] || "Sản phẩm";

    }


    // ========================================
    // LOAD PRODUCT
    // ========================================

    async function loadProduct() {

        const {
            data,
            error
        } = await supabaseClient

            .from("products")

            .select("*")

            .eq("id", productId)

            .single();


        if (error) {

            console.error(
                "Lỗi lấy sản phẩm:",
                error
            );

            productName.textContent =
                "KHÔNG TÌM THẤY SẢN PHẨM";

            productDescription.textContent =
                error.message;

            return;

        }


        currentProduct = data;


        // ========================================
        // DISPLAY
        // ========================================

        document.title =
            `${data.name} | Xưởng In Nhỏ`;


        productName.textContent =
            data.name;


        productCategory.textContent =
            getCategoryName(data.category);


        productPrice.textContent =
            formatMoney(data.price);


        productDescription.textContent =
            data.description ||
            "Sản phẩm in 3D tại Xưởng In Nhỏ.";


        productMaterial.textContent =
            data.material || "-";


        productWeight.textContent =
            data.weight !== null &&
                data.weight !== undefined
                ? `${data.weight} g`
                : "-";


        productPrintTime.textContent =
            data.print_time || "-";


        productPrinter.textContent =
            data.printer || "-";


        productSize.textContent =
            data.size || "-";


        productInfill.textContent =
            data.infill || "-";


        productSupport.textContent =
            data.support || "-";


        productColors.textContent =
            data.colors || "-";


        // ========================================
        // IMAGE
        // ========================================

        if (data.image_url) {

            productImage.src =
                data.image_url;

            productImage.alt =
                data.name;

        } else {

            productImage.style.display =
                "none";

        }


        // ========================================
        // TAGS
        // ========================================

        productTags.innerHTML = "";


        if (data.material) {

            productTags.innerHTML += `
                <span class="detail-tag">
                    ${data.material}
                </span>
            `;

        }


        if (data.weight) {

            productTags.innerHTML += `
                <span class="detail-tag">
                    ${data.weight} g
                </span>
            `;

        }


        if (data.colors) {

            productTags.innerHTML += `
                <span class="detail-tag">
                    ${data.colors}
                </span>
            `;

        }

    }


    // ========================================
    // CREATE QR
    // ========================================

    function createPaymentQR(product) {

        const amount =
            Number(product.price || 0);


        // Nội dung chuyển khoản
        // Không dấu + ngắn gọn để QR ổn định.

        const addInfo =
            `XINHO ${product.id.slice(0, 8)}`;


        const url =
            "https://img.vietqr.io/image/" +

            `${PAYMENT.bankId}-` +

            `${PAYMENT.accountNumber}-` +

            `compact2.jpg` +

            `?amount=${amount}` +

            `&addInfo=${encodeURIComponent(addInfo)}` +

            `&accountName=${encodeURIComponent(
                PAYMENT.accountName
            )}`;



        paymentProductName.textContent =
            product.name;


        paymentAmount.textContent =
            formatMoney(amount);


        bankName.textContent =
            PAYMENT.bankName;


        bankAccount.textContent =
            PAYMENT.accountNumber;


        bankOwner.textContent =
            PAYMENT.accountName;

    }


    // ========================================
    // ORDER
    // ========================================

    orderButton.addEventListener(
        "click",
        () => {

            if (!currentProduct) {

                return;

            }


            createPaymentQR(
                currentProduct
            );


            paymentModal.classList.add(
                "open"
            );


            document.body.style.overflow =
                "hidden";

        }
    );


    // ========================================
    // CLOSE PAYMENT
    // ========================================

    function closePayment() {

        paymentModal.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";

    }


    paymentClose.addEventListener(
        "click",
        closePayment
    );


    document
        .querySelector(".payment-overlay")
        .addEventListener(
            "click",
            closePayment
        );


    // ========================================
    // START
    // ========================================

    await loadProduct();

});