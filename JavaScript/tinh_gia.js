/*
=========================================================
TINH_GIA.JS
Máy tính giá sản phẩm Xưởng In Nhỏ
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CẤU HÌNH GIÁ
    // =====================================================

    const PRICING = {
        // Giá nhựa tính theo gram
        material: {
            pla: 350,
            petg: 450
        },

        // Chi phí vận hành máy / giờ
        // Bao gồm điện + hao mòn + khấu hao + bảo trì
        machinePerHour: 5000,

        // Hao hụt + vật tư phụ
        overheadRate: 0.10,

        // Phí xưởng + lợi nhuận
        profitRate: 0.35,

        // Giá bán tối thiểu / sản phẩm
        minimumPrice: 20000,

        // Chi phí gia công
        finishing: {
            none: 0,
            simple: 5000,
            medium: 15000,
            complex: 30000
        }
    };


    // =====================================================
    // DOM
    // =====================================================

    const materialInput = document.getElementById("material");
    const weightInput = document.getElementById("weight");
    const hoursInput = document.getElementById("hours");
    const finishingInput = document.getElementById("finishing");
    const quantityInput = document.getElementById("quantity");

    const calculateButton =
        document.getElementById("calculateButton");

    const outMaterial =
        document.getElementById("outMaterial");

    const outMachine =
        document.getElementById("outMachine");

    const outFinishing =
        document.getElementById("outFinishing");

    const outOverhead =
        document.getElementById("outOverhead");

    const outCost =
        document.getElementById("outCost");

    const outProfit =
        document.getElementById("outProfit");

    const outPrice =
        document.getElementById("outPrice");

    const outUnitPrice =
        document.getElementById("outUnitPrice");

    const materialDetail =
        document.getElementById("materialDetail");

    const machineDetail =
        document.getElementById("machineDetail");

    const finishingDetail =
        document.getElementById("finishingDetail");

    const priceExplanation =
        document.getElementById("priceExplanation");


    // =====================================================
    // FORMAT TIỀN
    // =====================================================

    function formatMoney(number) {
        return Math.round(number).toLocaleString("vi-VN") + " đ";
    }


    // =====================================================
    // FORMAT GIỜ
    // =====================================================

    function formatHours(hours) {

        const totalMinutes = Math.round(hours * 60);

        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;

        if (h === 0) {
            return `${m} phút`;
        }

        if (m === 0) {
            return `${h} giờ`;
        }

        return `${h} giờ ${m} phút`;
    }


    // =====================================================
    // TÍNH GIÁ
    // =====================================================

    function calculatePrice() {

        const material = materialInput.value;

        const weight =
            Math.max(
                0,
                Number(weightInput.value) || 0
            );

        const hours =
            Math.max(
                0,
                Number(hoursInput.value) || 0
            );

        const finishing =
            finishingInput.value;

        const quantity =
            Math.max(
                1,
                Number(quantityInput.value) || 1
            );


        // =================================================
        // 1. VẬT LIỆU
        // =================================================

        const materialRate =
            PRICING.material[material];

        const materialCost =
            weight * materialRate;


        // =================================================
        // 2. VẬN HÀNH MÁY
        // =================================================

        const machineCost =
            hours * PRICING.machinePerHour;


        // =================================================
        // 3. GIA CÔNG
        // =================================================

        const finishingCost =
            PRICING.finishing[finishing];


        // =================================================
        // 4. HAO HỤT + CHI PHÍ PHỤ
        // =================================================

        const overhead =
            materialCost * PRICING.overheadRate;


        // =================================================
        // 5. CHI PHÍ SẢN XUẤT
        // =================================================

        const productionCost =
            materialCost +
            machineCost +
            finishingCost +
            overhead;


        // =================================================
        // 6. PHÍ XƯỞNG + LỢI NHUẬN
        // =================================================

        const profit =
            productionCost *
            PRICING.profitRate;


        // =================================================
        // 7. GIÁ BÁN
        // =================================================

        let calculatedPrice =
            productionCost + profit;


        // =================================================
        // 8. GIÁ TỐI THIỂU
        // =================================================

        const minimumTotal =
            PRICING.minimumPrice * quantity;

        if (calculatedPrice < minimumTotal) {
            calculatedPrice = minimumTotal;
        }


        // =================================================
        // 9. GIÁ THEO SẢN PHẨM
        // =================================================

        const unitPrice =
            calculatedPrice / quantity;


        // =================================================
        // 10. HIỂN THỊ KẾT QUẢ
        // =================================================

        if (outMaterial) {
            outMaterial.textContent =
                formatMoney(materialCost);
        }

        if (outMachine) {
            outMachine.textContent =
                formatMoney(machineCost);
        }

        if (outFinishing) {
            outFinishing.textContent =
                formatMoney(finishingCost);
        }

        if (outOverhead) {
            outOverhead.textContent =
                formatMoney(overhead);
        }

        if (outCost) {
            outCost.textContent =
                formatMoney(productionCost);
        }

        if (outProfit) {
            outProfit.textContent =
                formatMoney(profit);
        }

        if (outPrice) {
            outPrice.textContent =
                formatMoney(calculatedPrice);
        }

        if (outUnitPrice) {
            outUnitPrice.textContent =
                formatMoney(unitPrice) +
                " / sản phẩm";
        }


        // =================================================
        // 11. CHI TIẾT
        // =================================================

        if (materialDetail) {
            materialDetail.textContent =
                `${weight} g × ${formatMoney(materialRate)}/g`;
        }

        if (machineDetail) {
            machineDetail.textContent =
                `${formatHours(hours)} × ${formatMoney(PRICING.machinePerHour)}/giờ`;
        }

        if (finishingDetail) {
            finishingDetail.textContent =
                getFinishingText(finishing);
        }


        // =================================================
        // 12. GIẢI THÍCH GIÁ
        // =================================================

        if (priceExplanation) {

            if (calculatedPrice === minimumTotal) {

                priceExplanation.textContent =
                    `Chi phí sản xuất được tính từ vật liệu, ` +
                    `thời gian máy, gia công và hao hụt. ` +
                    `Đơn hàng này chạm mức giá tối thiểu ` +
                    `${formatMoney(PRICING.minimumPrice)} / sản phẩm ` +
                    `để đảm bảo xưởng không phải sản xuất dưới mức ` +
                    `chi phí hợp lý.`;

            } else {

                priceExplanation.textContent =
                    `Giá được tính từ chi phí sản xuất thực tế ` +
                    `cộng ${PRICING.profitRate * 100}% phí xưởng & lợi nhuận. ` +
                    `Khoản này giúp xưởng duy trì máy móc, bảo trì ` +
                    `thiết bị và tiếp tục nhận các đơn hàng sau.`;
            }
        }


        // =================================================
        // 13. ĐỔI TRẠNG THÁI NÚT
        // =================================================

        if (calculateButton) {
            calculateButton.textContent =
                "TÍNH LẠI GIÁ →";
        }
    }


    // =====================================================
    // TÊN GIA CÔNG
    // =====================================================

    function getFinishingText(type) {

        switch (type) {

            case "none":
                return "Không / rất ít — 0 đ";

            case "simple":
                return "Gia công đơn giản — 5.000 đ";

            case "medium":
                return "Gia công trung bình — 15.000 đ";

            case "complex":
                return "Gia công phức tạp — 30.000 đ";

            default:
                return "—";
        }
    }


    // =====================================================
    // NÚT TÍNH GIÁ
    // =====================================================

    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            () => {
                calculatePrice();
            }
        );

    }

});