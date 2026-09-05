/* =========================================================
   ĐĂNG NHẬP ADMIN
   Xưởng In Nhỏ
   SUPABASE AUTH
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =================================================
           SUPABASE CONFIG
        ================================================= */

        const SUPABASE_URL =
            "https://jydcsmapxqjworpqwepq.supabase.co";

        const SUPABASE_PUBLISHABLE_KEY =
            "sb_publishable_PgwQrBK__zIQ7yyB9Izjig_0jQ2ze6O";


        const supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        /* =================================================
           DOM
        ================================================= */

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const emailInput =
            document.getElementById(
                "email"
            );

        const passwordInput =
            document.getElementById(
                "password"
            );

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );


        /* =================================================
           NẾU ĐÃ ĐĂNG NHẬP
        ================================================= */

        const {
            data: sessionData
        } = await supabaseClient
            .auth
            .getSession();


        if (
            sessionData &&
            sessionData.session
        ) {

            window.location.href =
                "danhsachsanpham.html";

            return;
        }


        /* =================================================
           HIỆN / ẨN MẬT KHẨU
        ================================================= */

        togglePassword.addEventListener(
            "click",
            () => {

                const isPassword =
                    passwordInput.type ===
                    "password";


                if (isPassword) {

                    passwordInput.type =
                        "text";

                    togglePassword.textContent =
                        "ẨN";

                } else {

                    passwordInput.type =
                        "password";

                    togglePassword.textContent =
                        "HIỆN";
                }
            }
        );


        /* =================================================
           ĐĂNG NHẬP
        ================================================= */

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    emailInput.value.trim();

                const password =
                    passwordInput.value;


                /* -----------------------------------------
                   VALIDATE
                ----------------------------------------- */

                if (!email) {

                    showMessage(
                        "Vui lòng nhập email.",
                        true
                    );

                    emailInput.focus();

                    return;
                }


                if (!password) {

                    showMessage(
                        "Vui lòng nhập mật khẩu.",
                        true
                    );

                    passwordInput.focus();

                    return;
                }


                /* -----------------------------------------
                   DISABLE BUTTON
                ----------------------------------------- */

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "ĐANG ĐĂNG NHẬP...";


                hideMessage();


                try {

                    /* -------------------------------------
                       SUPABASE LOGIN
                    ------------------------------------- */

                    const {
                        data,
                        error
                    } = await supabaseClient
                        .auth
                        .signInWithPassword({
                            email:
                                email,
                            password:
                                password
                        });


                    if (error) {

                        console.error(
                            "Login error:",
                            error
                        );

                        throw new Error(
                            "Email hoặc mật khẩu không chính xác."
                        );
                    }


                    if (!data.session) {

                        throw new Error(
                            "Không thể tạo phiên đăng nhập."
                        );
                    }


                    /* -------------------------------------
                       SUCCESS
                    ------------------------------------- */

                    showMessage(
                        "✓ Đăng nhập thành công!",
                        false
                    );


                    loginButton.textContent =
                        "ĐANG CHUYỂN TRANG...";


                    setTimeout(
                        () => {

                            window.location.href =
                                "danhsachsanpham.html";

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        error
                    );

                    showMessage(
                        error.message ||
                        "Đăng nhập thất bại.",
                        true
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "ĐĂNG NHẬP →";
                }
            }
        );


        /* =================================================
           MESSAGE
        ================================================= */

        function showMessage(
            message,
            error = false
        ) {

            loginMessage.textContent =
                message;

            loginMessage.className =
                "login-message " +
                (
                    error
                        ? "error"
                        : "success"
                );
        }


        function hideMessage() {

            loginMessage.textContent =
                "";

            loginMessage.className =
                "login-message";
        }

    }
);