let opts = `
<option value="0">Chọn</option>
<option value="50538">Hà Nội</option>
<option value="50539">Hà Giang</option>
<option value="50540">Cao Bằng</option>
<option value="50541">Bắc Kạn</option>
<option value="50542">Tuyên Quang</option>
<option value="50543">Lào Cai</option>
<option value="50544">Điện Biên</option>
<option value="50545">Lai Châu</option>
<option value="50546">Sơn La</option>
<option value="50547">Yên Bái</option>
<option value="50548">Hoà Bình</option>
<option value="50549">Thái Nguyên</option>
<option value="50550">Lạng Sơn</option>
<option value="50551">Quảng Ninh</option>
<option value="50552">Bắc Giang</option>
<option value="50553">Phú Thọ</option>
<option value="50554">Vĩnh Phúc</option>
<option value="50555">Bắc Ninh</option>
<option value="50556">Hải Dương</option>
<option value="50557">Hải Phòng</option>
<option value="50558">Hưng Yên</option>
<option value="50559">Thái Bình</option>
<option value="50560">Hà Nam</option>
<option value="50561">Nam Định</option>
<option value="50562">Ninh Bình</option>
<option value="50563">Thanh Hóa</option>
<option value="50564">Nghệ An</option>
<option value="50565">Hà Tĩnh</option>
<option value="50566">Quảng Bình</option>
<option value="50567">Quảng Trị</option>
<option value="50568">Thừa Thiên Huế</option>
<option value="50569">Đà Nẵng</option>
<option value="50570">Quảng Nam</option>
<option value="50571">Quảng Ngãi</option>
<option value="50572">Bình Định</option>
<option value="50573">Phú Yên</option>
<option value="50574">Khánh Hòa</option>
<option value="50575">Ninh Thuận</option>
<option value="50576">Bình Thuận</option>
<option value="50577">Kon Tum</option>
<option value="50578">Gia Lai</option>
<option value="50579">Đắk Lắk</option>
<option value="50580">Đắk Nông</option>
<option value="50581">Lâm Đồng</option>
<option value="50582">Bình Phước</option>
<option value="50583">Tây Ninh</option>
<option value="50584">Bình Dương</option>
<option value="50585">Đồng Nai</option>
<option value="50586">Bà Rịa - Vũng Tàu</option>
<option value="50587">Hồ Chí Minh</option>
<option value="50588">Long An</option>
<option value="50589">Tiền Giang</option>
<option value="50590">Bến Tre</option>
<option value="50591">Trà Vinh</option>
<option value="50592">Vĩnh Long</option>
<option value="50593">Đồng Tháp</option>
<option value="50594">An Giang</option>
<option value="50595">Kiên Giang</option>
<option value="50596">Cần Thơ</option>
<option value="50597">Hậu Giang</option>
<option value="50598">Sóc Trăng</option>
<option value="50599">Bạc Liêu</option>
<option value="50600">Cà Mau</option>
`

let list = opts.split("\n");
let res = list.map(x => {
  return {
    value: x.substring(x.indexOf('="') + 2, x.indexOf('">')),
    title: x.substring(x.indexOf('>') + 1, x.lastIndexOf('</'))
  }
})

console.log(JSON.stringify(res))