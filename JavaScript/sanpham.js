document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://jydcsmapxqjworpqwepq.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";

    const supabaseClient =
        supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    /* =====================================================
       DOM
    ===================================================== */

    const productGrid =
        document.getElementById("productGrid");

    const categoryButtons =
        document.querySelectorAll(".category-btn");

    const sortProducts =
        document.getElementById("sortProducts");


    /* =====================================================
       TÊN DANH MỤC
    ===================================================== */

    function getCategoryName(category) {

        const categories = {

            "moc-khoa":
                "Móc khóa",

            "gia-dung":
                "Đồ gia dụng",

            "trang-tri":
                "Trang trí",

            "mo-hinh":
                "Mô hình",

            "phu-kien":
                "Phụ kiện"
        };

        return categories[category] ||
            "Sản phẩm";
    }


    /* =====================================================
       FORMAT GIÁ
    ===================================================== */

    function formatMoney(value) {

        return Number(value || 0)
            .toLocaleString("vi-VN") +
            " VNĐ";
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text ?? "";

        return div.innerHTML;
    }


    /* =====================================================
       LẤY SẢN PHẨM TỪ SUPABASE
    ===================================================== */

    async function loadProducts() {

        productGrid.innerHTML = `
            <div class="products-loading">
                ĐANG TẢI SẢN PHẨM...
            </div>
        `;


        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Lỗi lấy sản phẩm:",
                error
            );


            productGrid.innerHTML = `
                <div class="products-loading">
                    KHÔNG THỂ TẢI SẢN PHẨM.
                    <br><br>
                    ${escapeHTML(error.message)}
                </div>
            `;

            return [];
        }


        return data || [];
    }


    /* =====================================================
       HIỂN THỊ SẢN PHẨM
    ===================================================== */

    function renderProducts(products) {

        if (!products.length) {

            productGrid.innerHTML = `
                <div class="products-loading">
                    HIỆN CHƯA CÓ SẢN PHẨM NÀO.
                </div>
            `;

            return;
        }


        productGrid.innerHTML =
            products.map(product => {

                const imageHTML =
                    product.image_url

                        ? `
                        <img
                            src="${escapeHTML(
                            product.image_url
                        )}"
                            alt="${escapeHTML(
                            product.name
                        )}"
                            loading="lazy"
                        >
                    `

                        : `
                        <div class="no-product-image">
                            CHƯA CÓ HÌNH
                        </div>
                    `;


                return `
                    <article
                        class="product-card"
                        data-category="${escapeHTML(
                    product.category
                )}"
                        data-price="${Number(
                    product.price || 0
                )}"
                        data-weight="${Number(
                    product.weight || 0
                )}"
                    >

                        <div class="product-image">

                            ${imageHTML}

                        </div>


                        <div class="product-content">

                            <div class="product-category">
                                ${escapeHTML(
                    getCategoryName(
                        product.category
                    )
                )}
                            </div>


                            <h2 class="product-title">
                                ${escapeHTML(
                    product.name
                )}
                            </h2>


                            <p class="product-description">
                                ${escapeHTML(
                    product.description ||
                    "Sản phẩm in 3D tại Xưởng In Nhỏ."
                )}
                            </p>


                            <div class="product-price">
                                ${formatMoney(
                    product.price
                )}
                            </div>


                            <div class="product-tags">

                                ${product.material
                        ? `
                                        <span class="product-tag">
                                            ${escapeHTML(
                            product.material
                        )}
                                        </span>
                                      `
                        : ""
                    }


                                ${product.weight !== null &&
                        product.weight !== undefined &&
                        product.weight !== ""
                        ? `
                                        <span class="product-tag">
                                            ${escapeHTML(
                            product.weight
                        )} g
                                        </span>
                                      `
                        : ""
                    }

                            </div>


                            <div class="product-specs">

                                ${product.print_time
                        ? `
                                        <div class="spec">
                                            <span>
                                                Thời gian in
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.print_time
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }


                                ${product.printer
                        ? `
                                        <div class="spec">
                                            <span>
                                                Máy in
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.printer
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }


                                ${product.size
                        ? `
                                        <div class="spec">
                                            <span>
                                                Kích thước
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.size
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }


                                ${product.infill
                        ? `
                                        <div class="spec">
                                            <span>
                                                Infill
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.infill
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }


                                ${product.support
                        ? `
                                        <div class="spec">
                                            <span>
                                                Support
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.support
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }


                                ${product.colors
                        ? `
                                        <div class="spec">
                                            <span>
                                                Màu
                                            </span>

                                            <span>
                                                ${escapeHTML(
                            product.colors
                        )}
                                            </span>
                                        </div>
                                      `
                        : ""
                    }

                            </div>


                            <a
    href="chitietsanpham-khach.html?id=${encodeURIComponent(product.id)}"
    class="product-button">
    XEM SẢN PHẨM
</a>

                        </div>

                    </article>
                `;

            }).join("");
    }


    /* =====================================================
       LỌC SẢN PHẨM
    ===================================================== */

    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                const category =
                    button.dataset.category;


                const products =
                    document.querySelectorAll(
                        ".product-card"
                    );


                products.forEach(product => {

                    if (
                        category === "all" ||
                        product.dataset.category ===
                        category
                    ) {

                        product.style.display =
                            "";

                    } else {

                        product.style.display =
                            "none";
                    }

                });

            }
        );

    });


    /* =====================================================
       SẮP XẾP
    ===================================================== */

    sortProducts.addEventListener(
        "change",
        () => {

            const products =
                Array.from(
                    document.querySelectorAll(
                        ".product-card"
                    )
                );


            const value =
                sortProducts.value;


            if (value === "default") {

                /*
                    Khi default:
                    tải lại sản phẩm theo
                    created_at từ Supabase
                */

                loadProducts().then(
                    products => {
                        renderProducts(
                            products
                        );
                    }
                );

                return;
            }


            if (value === "price-low") {

                products.sort(
                    (a, b) => {

                        return (
                            Number(
                                a.dataset.price
                            ) -
                            Number(
                                b.dataset.price
                            )
                        );

                    }
                );
            }


            if (value === "price-high") {

                products.sort(
                    (a, b) => {

                        return (
                            Number(
                                b.dataset.price
                            ) -
                            Number(
                                a.dataset.price
                            )
                        );

                    }
                );
            }


            if (value === "weight-low") {

                products.sort(
                    (a, b) => {

                        return (
                            Number(
                                a.dataset.weight
                            ) -
                            Number(
                                b.dataset.weight
                            )
                        );

                    }
                );
            }


            products.forEach(product => {

                productGrid.appendChild(
                    product
                );

            });

        }
    );


    /* =====================================================
       KHỞI ĐỘNG
    ===================================================== */

    const products =
        await loadProducts();


    renderProducts(
        products
    );

});
