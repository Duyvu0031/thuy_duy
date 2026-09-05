
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
       DOM
    ===================================================== */

    const productName =
        document.getElementById("productName");

    const productPrice =
        document.getElementById("productPrice");

    const productCategory =
        document.getElementById("productCategory");

    const productDescription =
        document.getElementById("productDescription");

    const productImage =
        document.getElementById("productImage");

    const imagePreview =
        document.getElementById("imagePreview");

    const material =
        document.getElementById("material");

    const printTime =
        document.getElementById("printTime");

    const printer =
        document.getElementById("printer");

    const weight =
        document.getElementById("weight");

    const size =
        document.getElementById("size");

    const infill =
        document.getElementById("infill");

    const support =
        document.getElementById("support");

    const colors =
        document.getElementById("colors");

    const saveProduct =
        document.getElementById("saveProduct");

    const clearForm =
        document.getElementById("clearForm");

    const formMessage =
        document.getElementById("formMessage");

    const previewImage =
        document.getElementById("previewImage");

    const previewName =
        document.getElementById("previewName");

    const previewPrice =
        document.getElementById("previewPrice");

    const previewCategory =
        document.getElementById("previewCategory");

    const previewMaterial =
        document.getElementById("previewMaterial");

    const previewTime =
        document.getElementById("previewTime");

    const previewPrinter =
        document.getElementById("previewPrinter");

    const previewWeight =
        document.getElementById("previewWeight");

    const adminProductList =
        document.getElementById("adminProductList");

    const deleteAllProducts =
        document.getElementById("deleteAllProducts");


    let currentImage = "";


    /* =====================================================
       KIỂM TRA ĐĂNG NHẬP
    ===================================================== */

    async function checkLogin() {

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();

        if (error) {

            console.error(
                "Lỗi kiểm tra đăng nhập:",
                error
            );

            return false;
        }

        if (!data.user) {

            showMessage(
                "Bạn chưa đăng nhập tài khoản quản trị.",
                true
            );

            saveProduct.disabled = true;

            return false;
        }

        console.log(
            "Đã đăng nhập:",
            data.user.email
        );

        return true;
    }


    /* =====================================================
       FORMAT GIÁ
    ===================================================== */

    function formatMoney(value) {

        return Number(value || 0)
            .toLocaleString("vi-VN") + " đ";
    }


    /* =====================================================
       TÊN DANH MỤC
    ===================================================== */

    function getCategoryName(category) {

        const categories = {

            "moc-khoa":
                "MÓC KHÓA",

            "gia-dung":
                "ĐỒ GIA DỤNG",

            "trang-tri":
                "TRANG TRÍ",

            "mo-hinh":
                "MÔ HÌNH",

            "phu-kien":
                "PHỤ KIỆN"
        };

        return categories[category] ||
            "SẢN PHẨM";
    }


    /* =====================================================
       TẠO SLUG
    ===================================================== */

    function createSlug(text) {

        return text
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
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
       XỬ LÝ HÌNH ẢNH - PREVIEW
    ===================================================== */

    productImage.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                showMessage(
                    "Vui lòng chọn file hình ảnh.",
                    true
                );

                productImage.value = "";

                return;
            }


            /* Giới hạn 10MB */

            if (file.size > 10 * 1024 * 1024) {

                showMessage(
                    "Ảnh không được lớn hơn 10MB.",
                    true
                );

                productImage.value = "";

                return;
            }


            const reader =
                new FileReader();

            reader.onload = (e) => {

                currentImage =
                    e.target.result;

                imagePreview.innerHTML = `
                    <img
                        src="${currentImage}"
                        alt="Ảnh sản phẩm"
                    >
                `;

                imagePreview.style.display =
                    "block";

                updatePreview();
            };

            reader.readAsDataURL(file);
        }
    );


    /* =====================================================
       PREVIEW
    ===================================================== */

    function updatePreview() {

        previewName.textContent =
            productName.value.trim() ||
            "Tên sản phẩm";


        previewPrice.textContent =
            formatMoney(
                productPrice.value
            );


        previewCategory.textContent =
            getCategoryName(
                productCategory.value
            );


        previewMaterial.textContent =
            material.value || "—";


        previewTime.textContent =
            printTime.value.trim() ||
            "—";


        previewPrinter.textContent =
            printer.value || "—";


        previewWeight.textContent =
            weight.value
                ? `${weight.value} g`
                : "—";


        if (currentImage) {

            previewImage.innerHTML = `
                <img
                    src="${currentImage}"
                    alt="${escapeHTML(
                productName.value ||
                "Sản phẩm"
            )}"
                >
            `;
        }
    }


    /* =====================================================
       CẬP NHẬT PREVIEW KHI NHẬP
    ===================================================== */

    const previewInputs = [

        productName,
        productPrice,
        productCategory,
        material,
        printTime,
        printer,
        weight
    ];


    previewInputs.forEach(
        (input) => {

            input.addEventListener(
                "input",
                updatePreview
            );

            input.addEventListener(
                "change",
                updatePreview
            );
        }
    );


    /* =====================================================
       UPLOAD ẢNH LÊN SUPABASE STORAGE

       Bucket: product
       Folder: image1
    ===================================================== */

    async function uploadImage(file) {

        if (!file) {
            return null;
        }


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const fileName =
            `${Date.now()}-${crypto.randomUUID()}.${extension}`;


        /*
            Đường dẫn bên trong bucket:

            product
            └── image1
                └── fileName
        */

        const filePath =
            `image1/${fileName}`;


        console.log(
            "Đang upload:",
            filePath
        );


        const {
            error: uploadError
        } = await supabaseClient
            .storage
            .from("product")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                }
            );


        if (uploadError) {

            console.error(
                "LỖI UPLOAD STORAGE:",
                uploadError
            );

            /*
                Hiển thị lỗi thật để dễ sửa
            */

            throw new Error(
                `Upload ảnh thất bại: ${uploadError.message}`
            );
        }


        /*
            Lấy URL public
        */

        const {
            data
        } = supabaseClient
            .storage
            .from("product")
            .getPublicUrl(filePath);


        if (!data || !data.publicUrl) {

            throw new Error(
                "Không lấy được URL hình ảnh."
            );
        }


        console.log(
            "URL ảnh:",
            data.publicUrl
        );


        return data.publicUrl;
    }


    /* =====================================================
       LẤY DANH SÁCH SẢN PHẨM
    ===================================================== */

    async function getProducts() {

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

            showMessage(
                "Không thể tải danh sách sản phẩm.",
                true
            );

            return [];
        }


        return data || [];
    }


    /* =====================================================
       HIỂN THỊ DANH SÁCH
    ===================================================== */

    async function renderProducts() {

        adminProductList.innerHTML = `
            <div class="empty-products">
                ĐANG TẢI SẢN PHẨM...
            </div>
        `;


        const products =
            await getProducts();


        if (products.length === 0) {

            adminProductList.innerHTML = `
                <div class="empty-products">
                    CHƯA CÓ SẢN PHẨM NÀO ĐƯỢC ĐĂNG.
                </div>
            `;

            return;
        }


        adminProductList.innerHTML =
            products.map(
                (product) => {

                    return `

                        <div
                            class="admin-product-item"
                            data-id="${product.id}"
                        >

                            <div
                                class="admin-product-item-image"
                            >

                                ${product.image_url

                            ? `
                                        <img
                                            src="${escapeHTML(
                                product.image_url
                            )}"
                                            alt="${escapeHTML(
                                product.name
                            )}"
                                        >
                                      `

                            : `
                                        <div
                                            class="empty-products"
                                        >
                                            KHÔNG CÓ HÌNH
                                        </div>
                                      `
                        }

                            </div>


                            <div
                                class="admin-product-item-content"
                            >

                                <h3>
                                    ${escapeHTML(
                            product.name
                        )}
                                </h3>


                                <div
                                    class="admin-product-price"
                                >
                                    ${formatMoney(
                            product.price
                        )}
                                </div>


                                <div
                                    class="admin-product-actions"
                                >

                                    <button
                                        type="button"
                                        data-action="delete"
                                        data-id="${product.id}"
                                    >
                                        XÓA
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;
                }
            ).join("");
    }


    /* =====================================================
       ĐĂNG SẢN PHẨM
    ===================================================== */

    saveProduct.addEventListener(
        "click",
        async () => {


            /* ---------------------------------------------
               KIỂM TRA ĐĂNG NHẬP
            --------------------------------------------- */

            const loggedIn =
                await checkLogin();

            if (!loggedIn) {
                return;
            }


            /* ---------------------------------------------
               LẤY DỮ LIỆU
            --------------------------------------------- */

            const name =
                productName.value.trim();

            const price =
                Number(productPrice.value);


            /* ---------------------------------------------
               VALIDATE
            --------------------------------------------- */

            if (!name) {

                showMessage(
                    "Vui lòng nhập tên sản phẩm.",
                    true
                );

                productName.focus();

                return;
            }


            if (
                !price ||
                price < 0
            ) {

                showMessage(
                    "Vui lòng nhập giá sản phẩm.",
                    true
                );

                productPrice.focus();

                return;
            }


            const statusElement =
                document.querySelector(
                    'input[name="status"]:checked'
                );


            /* ---------------------------------------------
               FILE ẢNH
            --------------------------------------------- */

            const imageFile =
                productImage.files[0];


            /* ---------------------------------------------
               KHÓA NÚT
            --------------------------------------------- */

            saveProduct.disabled = true;

            saveProduct.textContent =
                "ĐANG ĐĂNG...";


            try {


                /* -----------------------------------------
                   UPLOAD ẢNH
                ----------------------------------------- */

                let imageUrl = null;


                if (imageFile) {

                    showMessage(
                        "Đang tải hình ảnh lên..."
                    );


                    imageUrl =
                        await uploadImage(
                            imageFile
                        );
                }


                /* -----------------------------------------
                   TẠO SLUG
                ----------------------------------------- */

                const slug =
                    `${createSlug(name)}-${Date.now()}`;


                /* -----------------------------------------
                   DỮ LIỆU SẢN PHẨM
                ----------------------------------------- */

                const product = {

                    name: name,

                    slug: slug,

                    price: price,

                    category:
                        productCategory.value,

                    description:
                        productDescription.value.trim(),

                    image_url:
                        imageUrl,

                    material:
                        material.value,

                    print_time:
                        printTime.value.trim(),

                    printer:
                        printer.value,

                    weight:
                        weight.value
                            ? Number(weight.value)
                            : null,

                    size:
                        size.value.trim(),

                    infill:
                        infill.value,

                    support:
                        support.value,

                    colors:
                        colors.value,

                    status:
                        statusElement
                            ? statusElement.value
                            : "Đang bán"
                };


                console.log(
                    "Dữ liệu sản phẩm:",
                    product
                );


                /* -----------------------------------------
                   INSERT SUPABASE
                ----------------------------------------- */

                const {
                    error
                } = await supabaseClient
                    .from("products")
                    .insert(product);


                if (error) {

                    console.error(
                        "Lỗi thêm sản phẩm:",
                        error
                    );

                    throw new Error(
                        `Không thể lưu sản phẩm: ${error.message}`
                    );
                }


                /* -----------------------------------------
                   THÀNH CÔNG
                ----------------------------------------- */

                showMessage(
                    "✓ Đã đăng sản phẩm thành công!"
                );


                clearFormFields();


                await renderProducts();


            } catch (error) {

                console.error(
                    "LỖI ĐĂNG SẢN PHẨM:",
                    error
                );


                showMessage(
                    "Lỗi: " + error.message,
                    true
                );


            } finally {

                saveProduct.disabled =
                    false;

                saveProduct.textContent =
                    "ĐĂNG SẢN PHẨM →";
            }
        }
    );


    /* =====================================================
       XÓA 1 SẢN PHẨM
    ===================================================== */

    adminProductList.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    '[data-action="delete"]'
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const confirmed =
                confirm(
                    "Bạn có chắc muốn xóa sản phẩm này?"
                );


            if (!confirmed) {
                return;
            }


            button.disabled = true;

            button.textContent =
                "ĐANG XÓA...";


            try {

                /*
                    Lấy thông tin ảnh trước khi xóa
                */

                const {
                    data: product,
                    error: getError
                } = await supabaseClient
                    .from("products")
                    .select("image_url")
                    .eq("id", id)
                    .single();


                if (getError) {

                    throw new Error(
                        getError.message
                    );
                }


                /*
                    Xóa record trong database
                */

                const {
                    error
                } = await supabaseClient
                    .from("products")
                    .delete()
                    .eq("id", id);


                if (error) {

                    throw new Error(
                        error.message
                    );
                }


                /*
                    Nếu có ảnh thì xóa ảnh khỏi Storage
                */

                if (
                    product &&
                    product.image_url
                ) {

                    await deleteStorageImage(
                        product.image_url
                    );
                }


                showMessage(
                    "✓ Đã xóa sản phẩm."
                );


                await renderProducts();


            } catch (error) {

                console.error(error);


                showMessage(
                    "Không thể xóa sản phẩm: " +
                    error.message,
                    true
                );


                button.disabled =
                    false;

                button.textContent =
                    "XÓA";
            }
        }
    );


    /* =====================================================
       XÓA ẢNH KHỎI STORAGE
    ===================================================== */

    async function deleteStorageImage(imageUrl) {

        try {

            /*
                URL thường có dạng:

                .../storage/v1/object/public/product/image1/abc.jpg

                Ta lấy phần:

                image1/abc.jpg
            */

            const marker =
                "/storage/v1/object/public/product/";


            const index =
                imageUrl.indexOf(marker);


            if (index === -1) {

                console.warn(
                    "Không xác định được đường dẫn ảnh:",
                    imageUrl
                );

                return;
            }


            const filePath =
                imageUrl.substring(
                    index + marker.length
                );


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

                return;
            }


            console.log(
                "Đã xóa ảnh:",
                filePath
            );


        } catch (error) {

            console.warn(
                "Lỗi xóa ảnh:",
                error
            );
        }
    }


    /* =====================================================
       XÓA TẤT CẢ SẢN PHẨM
    ===================================================== */

    deleteAllProducts.addEventListener(
        "click",
        async () => {


            const products =
                await getProducts();


            if (products.length === 0) {

                alert(
                    "Hiện chưa có sản phẩm nào."
                );

                return;
            }


            const confirmed =
                confirm(
                    "XÓA TOÀN BỘ SẢN PHẨM?\n\n" +
                    "Thao tác này không thể hoàn tác."
                );


            if (!confirmed) {
                return;
            }


            deleteAllProducts.disabled =
                true;


            try {


                /*
                    Xóa ảnh trong Storage
                */

                for (
                    const product of products
                ) {

                    if (
                        product.image_url
                    ) {

                        await deleteStorageImage(
                            product.image_url
                        );
                    }
                }


                /*
                    Xóa toàn bộ database
                */

                const {
                    error
                } = await supabaseClient
                    .from("products")
                    .delete()
                    .neq(
                        "id",
                        "00000000-0000-0000-0000-000000000000"
                    );


                if (error) {

                    throw new Error(
                        error.message
                    );
                }


                showMessage(
                    "✓ Đã xóa toàn bộ sản phẩm."
                );


                await renderProducts();


            } catch (error) {

                console.error(error);


                showMessage(
                    "Không thể xóa sản phẩm: " +
                    error.message,
                    true
                );


            } finally {

                deleteAllProducts.disabled =
                    false;
            }
        }
    );


    /* =====================================================
       XÓA FORM
    ===================================================== */

    clearForm.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Bạn muốn xóa toàn bộ nội dung đang nhập?"
                );


            if (!confirmed) {
                return;
            }


            clearFormFields();
        }
    );


    function clearFormFields() {

        productName.value = "";

        productPrice.value = "";

        productCategory.value =
            "moc-khoa";

        productDescription.value = "";

        productImage.value = "";

        material.value =
            "PLA";

        printTime.value = "";

        printer.value =
            "Bambu Lab A1";

        weight.value = "";

        size.value = "";

        infill.value =
            "15%";

        support.value =
            "Không";

        colors.value =
            "1 màu";


        const status =
            document.querySelector(
                'input[name="status"][value="Đang bán"]'
            );


        if (status) {

            status.checked =
                true;
        }


        currentImage = "";


        imagePreview.innerHTML = "";

        imagePreview.style.display =
            "none";


        previewImage.innerHTML = `
            <span>
                CHƯA CÓ HÌNH
            </span>
        `;


        updatePreview();
    }


    /* =====================================================
       THÔNG BÁO
    ===================================================== */

    function showMessage(
        message,
        error = false
    ) {

        formMessage.textContent =
            message;

        formMessage.style.display =
            "block";


        if (error) {

            formMessage.style.background =
                "#F4D8D3";

            formMessage.style.color =
                "#8F2F1E";

        } else {

            formMessage.style.background =
                "#DCE7DE";

            formMessage.style.color =
                "#234B3A";
        }


        setTimeout(
            () => {

                formMessage.style.display =
                    "none";

            },
            5000
        );
    }


    /* =====================================================
       KHỞI ĐỘNG
    ===================================================== */

    updatePreview();

    await checkLogin();

    await renderProducts();

});
