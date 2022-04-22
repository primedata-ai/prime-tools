function renderPopup() {

  function renderUI() {
    let domHtml = `
<div id="primedata-onsite-t001-popup" class="primedata-onsite">
    <!-- Modal content -->
    <div class="primedata-onsite-content">
        <div class="cdp_prime_t_001">
            <div id="primedata-onsite--close" class="primedata-onsite--close">&times;</div>
            <div class="cdp_prime_t_001_template-content">
                <div class="cdp_prime_t_001_image-panel"></div>
                <div class="cdp_prime_t_001_info-panel">
                    <div class="cdp_prime_t_001_header_logo">
                        <img src="https://primedata-ai.github.io/prime-tools/statics/assets/logo.png" alt="Logo" width="100" height="48">
                    </div>
                    <div class="cdp_prime_t_001_image-panel-mobile"></div>
                    <div class="cdp_prime_t_001_title">Tặng ngay voucher <br><span
                            class="cdp_prime_t_001_price">200.000 Đ</span>
                    </div>
                    <div class="cdp_prime_t_001_form">
                        <div class="cdp_prime_t_001_form-title">Quý khách lòng nhập thông tin để nhận voucher!</div>

                        <label for="phone_number"></label>
                        <input id="phone_number" type="text" placeholder="Số điện thoại">

                        <label for="email"></label>
                        <input id="email" type="email" placeholder="Địa chỉ email">

                        <button class="cdp_prime_t_001_cta-btn">Nhận Ngay</button>
                    </div>

                    <div class="cdp_prime_t_001_notes">
                        Voucher áp dụng cho đơn hàng online từ 1.000.000đ
                        <br> *Không áp dụng cộng dồn với các CTKM khác. Voucher có giá từ 16.04 - 30.04.2022
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
    document.body.insertAdjacentHTML("afterbegin", domHtml);

  }

  function renderStyle() {
    let css = `
 <style>
        body {
            margin: 0;
            padding: 0;
        }

        /* Modal Content */
        .primedata-onsite-content {
            margin: auto;
            width: 50%;
        }

        .cdp_prime_t_001 {
            font-family: Montserrat,sans-serif;

            width: 100%;
            /*height: 600px;*/
            border: 1px solid #d6d6d7;
            box-shadow: rgba(0, 0, 0, 0.35) 0 5px 15px;
            /*filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.4)) drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.12));*/
            position: relative;
        }


        /* The Close Button */
        .primedata-onsite--close {
            color: #aaaaaa;
            font-size: 28px;
            font-weight: bold;
            position: absolute;
            right: 10px;
        }

        .primedata-onsite--close:hover,
        .primedata-onsite--close:focus {
            color: #000;
            text-decoration: none;
            cursor: pointer;
        }

        .cdp_prime_t_001_template-content {
            display: grid;
            grid-template-columns: 60% 40%;
            height: 100%;
            width: 100%;
        }

        .cdp_prime_t_001_image-panel {
            background: url("https://primedata-ai.github.io/prime-tools/statics/assets/left-panel.png") no-repeat center;
            background-size: cover;
            height: 100%;
            width: 100%;
        }

        .cdp_prime_t_001_info-panel {
            padding: 12px 32px;
            background: #eaebed;
        }

        .cdp_prime_t_001_header_logo {
            display: flex;
            justify-content: center;
        }

        .cdp_prime_t_001_title {
            padding: 24px 0;
            text-align: center;
            text-transform: uppercase;
            font-size: 32px;
            font-weight: 700;
            color: #25263e;
            font-family: Montserrat,sans-serif;
        }

        .cdp_prime_t_001_price {
            color: #b61111;
        }

        .cdp_prime_t_001_cta-btn {
            background: #b61111;
            border-radius: 0.3125em 0.3125em 0.3125em 0.3125em;
            box-shadow: none;
            width: 100%;
            font-family: Montserrat,sans-serif;
            font-weight: bold;
            color: #fff;
            text-transform: uppercase;
            border: unset;


            cursor: pointer;
            text-align: center;
            line-height: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 12px 24px;
            margin: 12px 0;
        }

        .cdp_prime_t_001_form {
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .cdp_prime_t_001_form-title {
            word-break: break-word;
        }

        .cdp_prime_t_001_form > input {
            height: 40px;
            padding: 4px 12px;
            margin: 8px 0;
            box-sizing: border-box;
            border-radius: 8px;
            border: 1px solid #d6d6d7;
        }


        /* The Modal (background) */
        .primedata-onsite {
            display: flex; /* Hidden by default */
            justify-content: center;
            align-items: center;
            align-content: center;
            position: fixed; /* Stay in place */
            z-index: 2147483647; /* Sit on top */
            width: 100vw; /* Full width */
            height: 100vh; /* Full height */
            overflow: auto; /* Enable scroll if needed */
            background-color: rgb(0, 0, 0); /* Fallback color */
            background-color: rgba(49, 80, 85, .85); /* Black w/ opacity */
        }

        .cdp_prime_t_001_image-panel-mobile {
            display: none;
        }

        @media screen and (max-width: 1920px) {
            .primedata-onsite-content {
                width: 60%;
            }

            .cdp_prime_t_001_template-content {
                display: grid;
                grid-template-columns: 60% 40%;
            }
        }

        @media screen and (max-width: 999px) {
            .primedata-onsite-content {
                width: 80%;
            }
            .cdp_prime_t_001_template-content {
                display: grid;
                grid-template-columns: 50% 50%;
            }

            .cdp_prime_t_001_info-panel {
                padding: 12px;
            }
        }

        @media screen and (max-width: 576px) {
            .primedata-onsite-content {
                width: 100%;
            }

            .cdp_prime_t_001_template-content {
                display: flex;
                justify-content: center;
                flex-direction: column;
            }

            .cdp_prime_t_001_image-panel {
                display: none;
            }


            .cdp_prime_t_001_info-panel {
                padding: 12px;
            }

            .cdp_prime_t_001_image-panel-mobile {
                display: block;
                background: url("https://primedata-ai.github.io/prime-tools/statics/assets/left-panel.png") no-repeat center;
                background-size: cover;
                height: 160px;
                width: 100%;
                margin-top:24px;
            }

            .cdp_prime_t_001 {
                /*height: 420px;*/
                overflow: auto;
            }

            .cdp_prime_t_001_form {

            }

            .cdp_prime_t_001_form-title {
                text-align: center;
            }

            .cdp_prime_t_001_title {
                font-weight: bold;
                font-size: 20px;
                padding: 12px 0;
            }

            .cdp_prime_t_001_notes {
                text-align: center;
            }
        }


    </style>
`;
    document.head.insertAdjacentHTML("beforeend", css);
  }

  function triggerPopup() {
    // Get the modal
    let primeOnsiteModal = document.getElementById("primedata-onsite-t001-popup");

    // Get the <div> element that closes the modal
    let primeBtnClosed = document.getElementById("primedata-onsite--close");

    // When the user clicks the button, open the modal
    primeOnsiteModal.style.display = "flex";

    // When the user clicks on <span> (x), close the modal
    primeBtnClosed.onclick = function () {
      primeOnsiteModal.style.display = "none";
    };

    // When the user clicks anywhere outside the modal, close it
    // window.onclick = function (event) {
    //   if (event.target === primeOnsiteModal) {
    //     primeOnsiteModal.style.display = "none";
    //   }
    // };
  }

  renderUI();
  renderStyle();
  triggerPopup();
}