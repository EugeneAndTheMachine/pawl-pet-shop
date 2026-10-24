import aboutFood from '../../../assets/images/about-food.webp'
import bowl from '../../../assets/images/bowl.webp'
import { CheckIcon } from '../../../components/ui/icons'

const POINTS = ['Lọc sản phẩm theo nhu cầu sức khoẻ của bé', 'Thành phần, năng lượng và lượng ăn ghi rõ ràng', 'Giao trong ngày, thanh toán khi nhận hàng']

export function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Decorative bowl cut by the section edge, as in the landing page design */}
      <img src={bowl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 hidden w-48 rounded-full xl:block" />

      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] lg:py-24">
        <div>
          <h2 className="font-display text-4xl text-brand sm:text-5xl">Về Pawl</h2>
          <p className="mt-6 leading-relaxed">
            Pawl bắt đầu từ chính những người đi làm bận rộn đang nuôi “boss” ở TP.HCM và Hà Nội. Chúng mình hiểu cảm giác hết hạt giữa tuần mà không kịp ghé cửa
            hàng, hay đứng trước cả kệ thức ăn mà không biết loại nào hợp với bé.
          </p>
          <p className="mt-4 leading-relaxed">
            Vì vậy Pawl chọn lọc thức ăn, cát vệ sinh, snack và phụ kiện chính hãng, ghi rõ độ tuổi, nhu cầu sức khoẻ và thành phần, để bạn chọn đúng món cho bé
            chỉ trong vài phút.
          </p>
          <ul className="mt-6 space-y-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-xs text-white">
                  <CheckIcon />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <img src={aboutFood} alt="Bát hạt, hộp pate và dấu chân thú cưng" className="mx-auto w-full max-w-sm" loading="lazy" width={492} height={516} />
      </div>
    </section>
  )
}
