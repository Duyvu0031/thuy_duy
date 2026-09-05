/* =========================================================
   XƯỞNG IN NHỎ
   LIEN-HE.JS
   GỬI YÊU CẦU KHÁCH HÀNG
========================================================= */

const SUPABASE_URL =
    "https://jydcsmapxqjworpqwepq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   ELEMENTS
========================================================= */

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");


/* =========================================================
   HIỂN THỊ THÔNG BÁO
========================================================= */

function showMessage(message, type) {

    if (!formMessage) {
        return;
    }

    formMessage.textContent = message;

    formMessage.className =
        "form-message " + type;
}


/* =========================================================
   SUBMIT FORM
========================================================= */

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------------------
               LẤY DỮ LIỆU
            ----------------------------------------- */

            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("customerEmail")
                    .value
                    .trim();

            const productRequest =
                document
                    .getElementById("productRequest")
                    .value
                    .trim();

            const quantity =
                document
                    .getElementById("quantity")
                    .value;

            const material =
                document
                    .getElementById("material")
                    .value;

            const color =
                document
                    .getElementById("color")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            /* -----------------------------------------
               KIỂM TRA DỮ LIỆU
            ----------------------------------------- */

            if (!name) {

                showMessage(
                    "Vui lòng nhập họ và tên.",
                    "error"
                );

                return;
            }


            if (!phone) {

                showMessage(
                    "Vui lòng nhập số điện thoại.",
                    "error"
                );

                return;
            }


            if (!productRequest) {

                showMessage(
                    "Vui lòng cho biết bạn muốn in gì.",
                    "error"
                );

                return;
            }


            if (!description) {

                showMessage(
                    "Vui lòng mô tả yêu cầu của bạn.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               KHÓA NÚT
            ----------------------------------------- */

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "ĐANG GỬI...";
            }


            showMessage(
                "Đang gửi yêu cầu...",
                "loading"
            );


            /* -----------------------------------------
               INSERT SUPABASE
            ----------------------------------------- */

            try {

                const { error } =
                    await supabaseClient
                        .from("contact_requests")
                        .insert([
                            {
                                name: name,
                                phone: phone,
                                email: email || null,
                                product_name: productRequest,
                                quantity: quantity
                                    ? Number(quantity)
                                    : 1,
                                material: material || null,
                                color: color || null,
                                description: description,
                                status: "Chưa xử lý"
                            }
                        ]);


                /* -----------------------------------------
                   KIỂM TRA LỖI SUPABASE
                ----------------------------------------- */

                if (error) {

                    console.error(
                        "SUPABASE ERROR:",
                        error
                    );

                    showMessage(
                        "Lỗi Supabase: " + error.message,
                        "error"
                    );


                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "GỬI YÊU CẦU";
                    }

                    return;
                }


                /* -----------------------------------------
                   THÀNH CÔNG
                ----------------------------------------- */

                console.log(
                    "Đã gửi yêu cầu thành công!"
                );


                contactForm.innerHTML = `

                    <div class="contact-success">

                        <div class="success-icon">
                            ✓
                        </div>

                        <h2>
                            Đã gửi yêu cầu thành công!
                        </h2>

                        <p>
                            Cảm ơn bạn đã gửi yêu cầu đến
                            Xưởng In Nhỏ.
                        </p>

                        <p>
                            Thông tin của bạn đã được ghi nhận.
                            Xưởng sẽ xem yêu cầu và liên hệ
                            lại với bạn sớm nhất.
                        </p>

                        <a
                            href="sanpham.html"
                            class="btn btn-primary"
                        >
                            XEM SẢN PHẨM
                        </a>

                    </div>

                `;

            }


            /* -----------------------------------------
               LỖI JAVASCRIPT
            ----------------------------------------- */

            catch (error) {

                console.error(
                    "LỖI LIEN-HE.JS:",
                    error
                );


                showMessage(
                    "Có lỗi xảy ra: " + error.message,
                    "error"
                );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "GỬI YÊU CẦU";
                }

            }

        }
    );

}