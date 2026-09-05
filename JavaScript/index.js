
/* =========================================================
   XƯỞNG IN NHỎ
   INDEX.JS - TRANG CHỦ
========================================================= */


/* =========================================================
   1. SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://jydcsmapxqjworpqwepq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   2. TÊN DANH MỤC
========================================================= */

function getCategoryName(category) {

    const categories = {
        "moc-khoa": "Móc khóa",
        "gia-dung": "Gia dụng",
        "trang-tri": "Trang trí",
        "mo-hinh": "Mô hình",
        "phu-kien": "Phụ kiện"
    };

    return categories[category] || category || "Sản phẩm";
}


/* =========================================================
   3. FORMAT GIÁ
========================================================= */

function formatPrice(price) {

    if (
        price === null ||
        price === undefined ||
        price === ""
    ) {
        return "Liên hệ";
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
        return "Liên hệ";
    }

    return number.toLocaleString("vi-VN") + " đ";
}


/* =========================================================
   4. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   5. TẢI 4 SẢN PHẨM MỚI NHẤT
========================================================= */

async function loadHomeProducts() {

    console.log("Bắt đầu tải sản phẩm...");

    const productGrid =
        document.getElementById("homeProductGrid");

    if (!productGrid) {

        console.error(
            "Không tìm thấy #homeProductGrid trong index.html"
        );

        return;
    }

    try {

        const {
            data: products,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("status", "Đang bán")
            .order("created_at", {
                ascending: false
            })
            .limit(4);


        if (error) {

            console.error(
                "SUPABASE ERROR:",
                error
            );

            productGrid.innerHTML = `
                <div class="home-products-empty">
                    Không thể tải sản phẩm.
                </div>
            `;

            return;
        }


        if (!products || products.length === 0) {

            console.log(
                "Chưa có sản phẩm đang bán."
            );

            productGrid.innerHTML = `
                <div class="home-products-empty">
                    Hiện chưa có sản phẩm nào đang được nhận làm.
                </div>
            `;

            return;
        }


        console.log(
            "Đã tải được sản phẩm:",
            products
        );


        productGrid.innerHTML = products
            .map(product => createProductCard(product))
            .join("");

    }

    catch (error) {

        console.error(
            "LỖI INDEX.JS:",
            error
        );

        productGrid.innerHTML = `
            <div class="home-products-empty">
                Có lỗi xảy ra khi tải sản phẩm.
            </div>
        `;
    }
}


/* =========================================================
   6. TẠO CARD SẢN PHẨM
========================================================= */

function createProductCard(product) {

    const image =
        product.image_url ||
        "images/products/moc-khoa-ten.jpg";


    const name =
        escapeHTML(product.name);


    const category =
        escapeHTML(
            getCategoryName(product.category)
        );


    const description =
        escapeHTML(
            product.description ||
            "Sản phẩm được in theo yêu cầu tại Xưởng In Nhỏ."
        );


    const weight =
        product.weight !== null &&
            product.weight !== undefined &&
            product.weight !== ""
            ? `${product.weight} g`
            : "—";


    const printTime =
        escapeHTML(
            product.print_time || "—"
        );


    const price =
        formatPrice(product.price);


    const productId =
        encodeURIComponent(product.id);


    return `
        <article class="home-product-card">

            <a
                href="chitietsanpham-khach.html?id=${productId}"
                class="home-product-image"
                aria-label="Xem ${name}"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${name}"
                    loading="lazy"
                >

            </a>


            <div class="home-product-content">

                <div class="home-product-category">
                    ${category}
                </div>


                <h3 class="home-product-name">
                    ${name}
                </h3>


                <p class="home-product-description">
                    ${description}
                </p>


                <div class="home-product-meta">

                    <div class="home-product-meta-item">

                        <span class="home-product-meta-label">
                            Khối lượng
                        </span>

                        <span class="home-product-meta-value">
                            ${weight}
                        </span>

                    </div>


                    <div class="home-product-meta-item">

                        <span class="home-product-meta-label">
                            Thời gian
                        </span>

                        <span class="home-product-meta-value">
                            ${printTime}
                        </span>

                    </div>

                </div>


                <div class="home-product-bottom">

                    <span class="home-product-price">
                        ${price}
                    </span>


                    <a
                        href="chitietsanpham-khach.html?id=${productId}"
                        class="home-product-link"
                    >
                        Xem →
                    </a>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   7. SẢN PHẨM MỚI NHẤT TRÊN HERO
========================================================= */

async function loadLatestProduct() {

    console.log(
        "Đang tải sản phẩm mới nhất..."
    );


    const card =
        document.getElementById("latestProductCard");


    if (!card) {

        console.error(
            "Không tìm thấy #latestProductCard trong index.html"
        );

        return;
    }


    try {

        const {
            data: product,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .eq("status", "Đang bán")
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();


        if (error) {

            console.error(
                "Không thể tải sản phẩm mới nhất:",
                error
            );

            document.getElementById(
                "latestProductName"
            ).textContent =
                "Không thể tải sản phẩm";

            return;
        }


        if (!product) {

            document.getElementById(
                "latestProductName"
            ).textContent =
                "Chưa có sản phẩm";


            document.getElementById(
                "latestProductCategory"
            ).textContent =
                "Xưởng In Nhỏ";


            return;
        }


        /* ==============================
           HIỂN THỊ SẢN PHẨM
        ============================== */

        const image =
            product.image_url ||
            "images/products/moc-khoa-ten.jpg";


        document.getElementById(
            "latestProductName"
        ).textContent =
            product.name || "Sản phẩm";


        document.getElementById(
            "latestProductCategory"
        ).textContent =
            getCategoryName(product.category);


        document.getElementById(
            "latestProductImage"
        ).src =
            image;


        document.getElementById(
            "latestProductImage"
        ).alt =
            product.name || "Sản phẩm";


        document.getElementById(
            "latestProductWeight"
        ).textContent =
            product.weight !== null &&
                product.weight !== undefined &&
                product.weight !== ""
                ? product.weight + " g"
                : "—";


        document.getElementById(
            "latestProductTime"
        ).textContent =
            product.print_time || "—";


        document.getElementById(
            "latestProductMaterial"
        ).textContent =
            product.material || "—";


        document.getElementById(
            "latestProductPrinter"
        ).textContent =
            product.printer || "—";


        document.getElementById(
            "latestProductPrice"
        ).textContent =
            formatPrice(product.price);


        /* ==============================
           CLICK CARD → CHI TIẾT
        ============================== */

        card.style.cursor = "pointer";


        card.onclick = function () {

            window.location.href =
                "chitietsanpham-khach.html?id=" +
                encodeURIComponent(product.id);

        };


        console.log(
            "Sản phẩm mới nhất:",
            product.name
        );

    }

    catch (error) {

        console.error(
            "Lỗi tải sản phẩm mới nhất:",
            error
        );
    }
}


/* =========================================================
   8. CHẠY KHI TRANG ĐÃ LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "INDEX.JS đã chạy."
        );


        loadHomeProducts();

        loadLatestProduct();

    }
);

