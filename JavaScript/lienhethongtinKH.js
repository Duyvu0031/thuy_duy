/* =========================================================
   XƯỞNG IN NHỎ
   LIENHETHONGTINKH.JS
   THÔNG TIN KHÁCH HÀNG
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =================================================
        // SUPABASE
        // =================================================

        const SUPABASE_URL =
            "https://jydcsmapxqjworpqwepq.supabase.co";

        const SUPABASE_PUBLISHABLE_KEY =
            "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";

        const supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        // =================================================
        // DOM
        // =================================================

        const loading =
            document.getElementById("loading");

        const customerTable =
            document.getElementById("customerTable");

        const customerTableBody =
            document.getElementById("customerTableBody");

        const emptyMessage =
            document.getElementById("emptyMessage");

        const searchInput =
            document.getElementById("searchInput");

        const statusFilter =
            document.getElementById("statusFilter");

        const refreshBtn =
            document.getElementById("refreshBtn");

        const detailModal =
            document.getElementById("detailModal");

        const detailBody =
            document.getElementById("detailBody");

        const closeModal =
            document.getElementById("closeModal");


        let requests = [];


        // =================================================
        // KIỂM TRA ĐĂNG NHẬP
        // =================================================

        const {
            data: sessionData
        } = await supabaseClient
            .auth
            .getSession();


        if (
            !sessionData ||
            !sessionData.session
        ) {

            window.location.href =
                "dangnhap.html";

            return;
        }


        // =================================================
        // LOAD DATA
        // =================================================

        async function loadRequests() {

            loading.style.display =
                "block";

            customerTable.style.display =
                "none";

            emptyMessage.style.display =
                "none";


            const {
                data,
                error
            } = await supabaseClient
                .from("contact_requests")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "SUPABASE ERROR:",
                    error
                );

                loading.textContent =
                    "Không thể tải thông tin khách hàng.";

                return;
            }


            requests = (data || []).map(request => {

                const savedStatus = localStorage.getItem(
                    "contact_status_" + request.id
                );

                return {
                    ...request,
                    status: savedStatus || request.status || "Chưa xử lý"
                };
            });


            loading.style.display =
                "none";


            updateStats();

            renderTable();

        }


        // =================================================
        // FORMAT NGÀY
        // =================================================

        function formatDate(
            dateString
        ) {

            if (!dateString) {
                return "—";
            }


            const date =
                new Date(dateString);


            return date.toLocaleString(
                "vi-VN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        }


        // =================================================
        // ESCAPE HTML
        // =================================================

        function escapeHTML(value) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(value)
                .replaceAll(
                    "&",
                    "&amp;"
                )
                .replaceAll(
                    "<",
                    "&lt;"
                )
                .replaceAll(
                    ">",
                    "&gt;"
                )
                .replaceAll(
                    '"',
                    "&quot;"
                )
                .replaceAll(
                    "'",
                    "&#039;"
                );

        }


        // =================================================
        // STATUS CLASS
        // =================================================

        function statusClass(
            status
        ) {

            switch (status) {

                case "Đang xử lý":
                    return "status-processing";

                case "Đã liên hệ":
                    return "status-contacted";

                case "Hoàn thành":
                    return "status-done";

                default:
                    return "status-pending";

            }

        }


        // =================================================
        // RENDER TABLE
        // =================================================

        function renderTable() {

            const keyword =
                searchInput.value
                    .trim()
                    .toLowerCase();

            const selectedStatus =
                statusFilter.value;


            const filtered =
                requests.filter(
                    request => {

                        const searchText = [

                            request.name,

                            request.phone,

                            request.email,

                            request.product_name,

                            request.material,

                            request.color,

                            request.description

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        const matchSearch =
                            !keyword ||
                            searchText.includes(
                                keyword
                            );


                        const matchStatus =
                            !selectedStatus ||
                            request.status ===
                            selectedStatus;


                        return (
                            matchSearch &&
                            matchStatus
                        );

                    }
                );


            customerTableBody.innerHTML =
                "";


            if (
                filtered.length === 0
            ) {

                customerTable.style.display =
                    "none";

                emptyMessage.style.display =
                    "block";

                return;
            }


            customerTable.style.display =
                "table";

            emptyMessage.style.display =
                "none";


            filtered.forEach(
                (request, index) => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${escapeHTML(
                        request.name
                    )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(
                        request.phone
                    )}
                        </td>

                        <td>
                            ${escapeHTML(
                        request.email || "—"
                    )}
                        </td>

                        <td>
                            ${escapeHTML(
                        request.product_name
                    )}
                        </td>

                        <td>
                            ${request.quantity || 1}
                        </td>

                        <td>
                            ${escapeHTML(
                        request.material || "—"
                    )}
                        </td>

                        <td>
                            ${escapeHTML(
                        request.color || "—"
                    )}
                        </td>

                        <td class="date">
                            ${formatDate(
                        request.created_at
                    )}
                        </td>

                        <td>

                            <select
                                class="status ${statusClass(
                        request.status
                    )}"
                                data-id="${request.id}"
                            >

                                <option
                                    value="Chưa xử lý"
                                    ${request.status === "Chưa xử lý"
                            ? "selected"
                            : ""}
                                >
                                    Chưa xử lý
                                </option>

                                <option
                                    value="Đang xử lý"
                                    ${request.status === "Đang xử lý"
                            ? "selected"
                            : ""}
                                >
                                    Đang xử lý
                                </option>

                                <option
                                    value="Đã liên hệ"
                                    ${request.status === "Đã liên hệ"
                            ? "selected"
                            : ""}
                                >
                                    Đã liên hệ
                                </option>

                                <option
                                    value="Hoàn thành"
                                    ${request.status === "Hoàn thành"
                            ? "selected"
                            : ""}
                                >
                                    Hoàn thành
                                </option>

                            </select>

                        </td>

                        <td>

                            <button
                                class="detail-btn"
                                data-detail-id="${request.id}"
                            >
                                Chi tiết
                            </button>

                        </td>

                    `;


                    customerTableBody.appendChild(
                        row
                    );

                }
            );


            attachEvents();

        }


        // =================================================
        // EVENTS
        // =================================================

        function attachEvents() {

            document
                .querySelectorAll(
                    "[data-detail-id]"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                openDetail(
                                    button.dataset
                                        .detailId
                                );

                            }
                        );

                    }
                );


            document
                .querySelectorAll(
                    "[data-id]"
                )
                .forEach(
                    select => {

                        select.addEventListener(
                            "change",
                            async () => {

                                await updateStatus(
                                    select.dataset.id,
                                    select.value
                                );

                            }
                        );

                    }
                );

        }


        // =================================================
        // UPDATE STATUS
        // =================================================

        async function updateStatus(id, status) {

            // Lưu trạng thái vào trình duyệt
            localStorage.setItem(
                "contact_status_" + id,
                status
            );

            // Cập nhật trạng thái trong dữ liệu hiện tại
            const request = requests.find(
                item => String(item.id) === String(id)
            );

            if (request) {
                request.status = status;
            }

            updateStats();
            renderTable();
        }


        // =================================================
        // CHI TIẾT
        // =================================================

        function openDetail(id) {

            const request =
                requests.find(
                    item =>
                        item.id === id
                );


            if (!request) {
                return;
            }


            detailBody.innerHTML = `

                <div class="detail-row">
                    <div class="detail-label">
                        Họ và tên
                    </div>

                    <div>
                        ${escapeHTML(
                request.name
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Số điện thoại
                    </div>

                    <div>
                        ${escapeHTML(
                request.phone
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Email
                    </div>

                    <div>
                        ${escapeHTML(
                request.email ||
                "Không cung cấp"
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Sản phẩm
                    </div>

                    <div>
                        ${escapeHTML(
                request.product_name
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Số lượng
                    </div>

                    <div>
                        ${request.quantity || 1}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Loại nhựa
                    </div>

                    <div>
                        ${escapeHTML(
                request.material ||
                "Không cung cấp"
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Màu
                    </div>

                    <div>
                        ${escapeHTML(
                request.color ||
                "Không cung cấp"
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Ngày gửi
                    </div>

                    <div>
                        ${formatDate(
                request.created_at
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Trạng thái
                    </div>

                    <div>
                        ${escapeHTML(
                request.status ||
                "Chưa xử lý"
            )}
                    </div>
                </div>


                <div class="detail-row">
                    <div class="detail-label">
                        Mô tả
                    </div>

                    <div class="description">
                        ${escapeHTML(
                request.description ||
                "Không có"
            )}
                    </div>
                </div>

            `;


            detailModal.classList.add(
                "active"
            );

        }


        // =================================================
        // MODAL
        // =================================================

        closeModal.addEventListener(
            "click",
            () => {

                detailModal.classList.remove(
                    "active"
                );

            }
        );


        detailModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    detailModal
                ) {

                    detailModal.classList.remove(
                        "active"
                    );

                }

            }
        );


        // =================================================
        // SEARCH
        // =================================================

        searchInput.addEventListener(
            "input",
            renderTable
        );


        statusFilter.addEventListener(
            "change",
            renderTable
        );


        refreshBtn.addEventListener(
            "click",
            loadRequests
        );


        // =================================================
        // STATISTICS
        // =================================================

        function updateStats() {

            document.getElementById(
                "totalRequests"
            ).textContent =
                requests.length;


            document.getElementById(
                "pendingRequests"
            ).textContent =
                requests.filter(
                    item =>
                        item.status ===
                        "Chưa xử lý"
                ).length;


            document.getElementById(
                "processingRequests"
            ).textContent =
                requests.filter(
                    item =>
                        item.status ===
                        "Đang xử lý"
                ).length;


            document.getElementById(
                "doneRequests"
            ).textContent =
                requests.filter(
                    item =>
                        item.status ===
                        "Hoàn thành"
                ).length;

        }


        // =================================================
        // START
        // =================================================

        await loadRequests();

    }
);