/* =========================================================
   XƯỞNG IN NHỎ
   DANH SÁCH SẢN PHẨM - ADMIN
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://jydcsmapxqjworpqwepq.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";

    const supabaseClient = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productList =
        document.getElementById("productList");

    const productCount =
        document.getElementById("productCount");

    const searchInput =
        document.getElementById("searchInput");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const emptyState =
        document.getElementById("emptyState");

    const adminMessage =
        document.getElementById("adminMessage");

    const logoutButton =
        document.getElementById("logoutButton");

    const deleteAllButton =
        document.getElementById("deleteAllProducts");

    const deleteModal =
        document.getElementById("deleteModal");

    const deleteModalText =
        document.getElementById("deleteModalText");

    const cancelDelete =
        document.getElementById("cancelDelete");

    const confirmDelete =
        document.getElementById("confirmDelete");


    /* =====================================================
       STATE
    ===================================================== */

    let allProducts = [];

    let productToDelete = null;

    let isDeleting = false;


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    async function checkAdmin() {

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {

            window.location.href =
                "dangnhap.html";

            return false;
        }

        return true;
    }


    const isAdmin = await checkAdmin();

    if (!isAdmin) {
        return;
    }


    /* =====================================================
       CATEGORY NAME
    ===================================================== */

    function getCategoryName(category) {

        const categories = {

            "moc-khoa": "Móc khóa",

            "gia-dung": "Gia dụng",

            "trang-tri": "Trang trí",

            "mo-hinh": "Mô hình",

            "phu-kien": "Phụ kiện"

        };

        return categories[category] || category || "Khác";
    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        const number =
            Number(price || 0);

        return number.toLocaleString("vi-VN") + "đ";
    }


    /* =====================================================
       FORMAT WEIGHT
    ===================================================== */

    function formatWeight(weight) {

        if (
            weight === null ||
            weight === undefined ||
            weight === ""
        ) {
            return "—";
        }

        return `${weight}g`;
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(message, type = "success") {

        adminMessage.textContent = message;

        adminMessage.className =
            "admin-message show";

        if (type === "error") {
            adminMessage.classList.add("error");
        }

        clearTimeout(
            showMessage.timeout
        );

        showMessage.timeout =
            setTimeout(() => {

                adminMessage.className =
                    "admin-message";

                adminMessage.textContent = "";

            }, 4000);
    }


    /* =====================================================
       ESCAPE HTML
       Chống HTML injection khi render dữ liệu
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        if (status === "Đang bán") {
            return "status-selling";
        }

        if (status === "Hết hàng") {
            return "status-out";
        }

        if (status === "Sắp có") {
            return "status-coming";
        }

        return "";
    }


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    async function loadProducts() {

        productList.innerHTML = `
            <div class="product-loading-admin">
                <div class="loading-spinner"></div>
                <span>ĐANG TẢI SẢN PHẨM...</span>
            </div>
        `;

        emptyState.hidden = true;


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
                "Load products error:",
                error
            );

            productList.innerHTML = "";

            showMessage(
                "Không thể tải danh sách sản phẩm.",
                "error"
            );

            return;
        }


        allProducts = data || [];

        renderProducts();
    }


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    function getFilteredProducts() {

        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        const category =
            categoryFilter.value;

        const status =
            statusFilter.value;


        return allProducts.filter(product => {

            const matchesKeyword =
                !keyword ||
                String(product.name || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(product.description || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(product.material || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(product.printer || "")
                    .toLowerCase()
                    .includes(keyword);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            const matchesStatus =
                status === "all" ||
                product.status === status;


            return (
                matchesKeyword &&
                matchesCategory &&
                matchesStatus
            );
        });
    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts() {

        const products =
            getFilteredProducts();


        productCount.textContent =
            products.length;


        if (products.length === 0) {

            productList.innerHTML = "";

            emptyState.hidden = false;

            return;
        }


        emptyState.hidden = true;


        productList.innerHTML =
            products
                .map(product =>
                    createProductHTML(product)
                )
                .join("");


        attachProductEvents();
    }


    /* =====================================================
       CREATE PRODUCT HTML
    ===================================================== */

    function createProductHTML(product) {

        const imageHTML =
            product.image_url
                ? `
                    <div class="admin-product-image">
                        <img
                            src="${escapeHTML(product.image_url)}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy">
                    </div>
                `
                : `
                    <div class="admin-product-image no-image">
                        <span>KHÔNG CÓ ẢNH</span>
                    </div>
                `;


        const status =
            product.status || "Đang bán";


        return `
            <article
                class="admin-product-item"
                data-id="${escapeHTML(product.id)}">

                ${imageHTML}


                <div class="admin-product-info">

                    <div class="admin-product-top">

                        <h2 class="admin-product-name">
                            ${escapeHTML(product.name)}
                        </h2>

                        <span class="admin-product-category">
                            ${escapeHTML(
            getCategoryName(product.category)
        )}
                        </span>

                    </div>


                    <p class="admin-product-description">
                        ${escapeHTML(
            product.description ||
            "Chưa có mô tả sản phẩm."
        )
            }
                    </p>


                    <div class="admin-product-meta">

                        <span class="admin-meta-item">
                            NHỰA:
                            <strong>
                                ${escapeHTML(
                product.material || "—"
            )}
                            </strong>
                        </span>

                        <span class="admin-meta-item">
                            KHỐI LƯỢNG:
                            <strong>
                                ${formatWeight(
                product.weight
            )}
                            </strong>
                        </span>

                        <span class="admin-meta-item">
                            THỜI GIAN:
                            <strong>
                                ${escapeHTML(
                product.print_time || "—"
            )}
                            </strong>
                        </span>

                        <span class="admin-meta-item">
                            MÁY:
                            <strong>
                                ${escapeHTML(
                product.printer || "—"
            )}
                            </strong>
                        </span>

                    </div>

                </div>


                <div class="admin-product-right">

                    <span
                        class="admin-status ${getStatusClass(status)}">
                        ${escapeHTML(status)}
                    </span>


                    <div class="admin-product-price">
                        ${formatPrice(product.price)}
                    </div>


                    <div class="admin-product-actions">

                        <button
                            type="button"
                            class="product-action edit"
                            data-action="edit"
                            data-id="${escapeHTML(product.id)}">
                            SỬA
                        </button>

                        <button
                            type="button"
                            class="product-action delete"
                            data-action="delete"
                            data-id="${escapeHTML(product.id)}">
                            XÓA
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* =====================================================
       ATTACH PRODUCT EVENTS
    ===================================================== */

    function attachProductEvents() {

        const editButtons =
            productList.querySelectorAll(
                '[data-action="edit"]'
            );

        const deleteButtons =
            productList.querySelectorAll(
                '[data-action="delete"]'
            );


        /* EDIT */

        editButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    if (!id) {
                        return;
                    }

                    window.location.href =
                        `chitietsanpham.html?id=${encodeURIComponent(id)}`;
                }
            );
        });


        /* DELETE */

        deleteButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    openDeleteModal(id);
                }
            );
        });
    }


    /* =====================================================
       OPEN DELETE MODAL
    ===================================================== */

    function openDeleteModal(id) {

        const product =
            allProducts.find(
                item => item.id === id
            );


        if (!product) {
            return;
        }


        productToDelete = product;


        deleteModalText.textContent =
            `Bạn chắc chắn muốn xóa "${product.name}"? Sản phẩm sẽ bị xóa khỏi cơ sở dữ liệu.`;


        deleteModal.classList.add("open");

        deleteModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow =
            "hidden";
    }


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    function closeDeleteModal() {

        productToDelete = null;

        deleteModal.classList.remove("open");

        deleteModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";
    }


    /* =====================================================
       DELETE STORAGE IMAGE
    ===================================================== */

    async function deleteProductImage(imageUrl) {

        if (!imageUrl) {
            return;
        }


        try {

            const marker =
                "/storage/v1/object/public/product/";

            const index =
                imageUrl.indexOf(marker);


            if (index === -1) {
                return;
            }


            const filePath =
                decodeURIComponent(
                    imageUrl.substring(
                        index + marker.length
                    )
                );


            if (!filePath) {
                return;
            }


            const {
                error
            } = await supabaseClient
                .storage
                .from("product")
                .remove([
                    filePath
                ]);


            if (error) {

                console.warn(
                    "Không xóa được ảnh Storage:",
                    error
                );
            }

        } catch (error) {

            console.warn(
                "Storage image delete error:",
                error
            );
        }
    }


    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    async function deleteProduct(product) {

        if (!product || isDeleting) {
            return;
        }


        isDeleting = true;

        confirmDelete.disabled = true;

        confirmDelete.textContent =
            "ĐANG XÓA...";


        try {

            /* -----------------------------
               DELETE DATABASE
            ----------------------------- */

            const {
                error
            } = await supabaseClient
                .from("products")
                .delete()
                .eq("id", product.id);


            if (error) {

                throw error;
            }


            /* -----------------------------
               DELETE IMAGE
            ----------------------------- */

            await deleteProductImage(
                product.image_url
            );


            /* -----------------------------
               UPDATE LOCAL DATA
            ----------------------------- */

            allProducts =
                allProducts.filter(
                    item =>
                        item.id !== product.id
                );


            closeDeleteModal();

            renderProducts();


            showMessage(
                `Đã xóa sản phẩm "${product.name}".`
            );


        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            showMessage(
                "Không thể xóa sản phẩm. Kiểm tra quyền Supabase.",
                "error"
            );

        } finally {

            isDeleting = false;

            confirmDelete.disabled =
                false;

            confirmDelete.textContent =
                "XÓA SẢN PHẨM";
        }
    }


    /* =====================================================
       DELETE ALL PRODUCTS
    ===================================================== */

    async function deleteAllProducts() {

        if (allProducts.length === 0) {

            showMessage(
                "Hiện không có sản phẩm để xóa.",
                "error"
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Bạn có chắc chắn muốn xóa toàn bộ ${allProducts.length} sản phẩm không?\n\nThao tác này không thể hoàn tác.`
            );


        if (!confirmed) {
            return;
        }


        deleteAllButton.disabled = true;

        deleteAllButton.textContent =
            "ĐANG XÓA...";


        try {

            /* -----------------------------
               XÓA ẢNH STORAGE
            ----------------------------- */

            for (const product of allProducts) {

                await deleteProductImage(
                    product.image_url
                );
            }


            /* -----------------------------
               XÓA DATABASE
            ----------------------------- */

            const {
                error
            } = await supabaseClient
                .from("products")
                .delete()
                .not(
                    "id",
                    "is",
                    null
                );


            if (error) {

                throw error;
            }


            allProducts = [];

            renderProducts();


            showMessage(
                "Đã xóa toàn bộ sản phẩm."
            );


        } catch (error) {

            console.error(
                "Delete all error:",
                error
            );


            showMessage(
                "Không thể xóa toàn bộ sản phẩm.",
                "error"
            );

        } finally {

            deleteAllButton.disabled =
                false;

            deleteAllButton.textContent =
                "XÓA TẤT CẢ";
        }
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    searchInput.addEventListener(
        "input",
        renderProducts
    );


    /* =====================================================
       FILTER
    ===================================================== */

    categoryFilter.addEventListener(
        "change",
        renderProducts
    );

    statusFilter.addEventListener(
        "change",
        renderProducts
    );


    /* =====================================================
       DELETE MODAL EVENTS
    ===================================================== */

    cancelDelete.addEventListener(
        "click",
        closeDeleteModal
    );


    confirmDelete.addEventListener(
        "click",
        async () => {

            if (!productToDelete) {
                return;
            }

            await deleteProduct(
                productToDelete
            );
        }
    );


    /* Click overlay */

    deleteModal
        .querySelector(".delete-modal-overlay")
        .addEventListener(
            "click",
            closeDeleteModal
        );


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                deleteModal.classList.contains("open")
            ) {

                closeDeleteModal();
            }
        }
    );


    /* =====================================================
       DELETE ALL
    ===================================================== */

    deleteAllButton.addEventListener(
        "click",
        deleteAllProducts
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled =
                true;

            logoutButton.textContent =
                "ĐANG THOÁT...";


            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "ĐĂNG XUẤT";

                showMessage(
                    "Không thể đăng xuất.",
                    "error"
                );

                return;
            }


            window.location.href =
                "dangnhap.html";
        }
    );


    /* =====================================================
       LOAD
    ===================================================== */

    await loadProducts();

});