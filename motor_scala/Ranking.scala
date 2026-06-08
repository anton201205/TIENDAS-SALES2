import scala.io.Source

object Ranking {

  case class Juego(nombre: String, puntaje: Double, precio: Double)

def leerDatos(): List[Juego] = {

  val contenido =
    Source.fromFile("../datos/videojuegos.json", "UTF-8").mkString


  val objetoPatron = """\{[^}]+\}""".r

  val nombrePatron  = """"nombre"\s*:\s*"([^"]+)"""".r
  val puntajePatron = """"puntaje"\s*:\s*([0-9.]+)""".r
  val precioPatron  = """"precio"\s*:\s*([0-9.]+)""".r

  objetoPatron.findAllIn(contenido).flatMap { obj =>

    val nombre  = nombrePatron.findFirstMatchIn(obj).map(_.group(1))
    val puntaje = puntajePatron.findFirstMatchIn(obj).map(_.group(1).toDouble)
    val precio  = precioPatron.findFirstMatchIn(obj).map(_.group(1).toDouble)

    for {
      n <- nombre
      pt <- puntaje
      pr <- precio
    } yield Juego(n, pt, pr)

  }.toList
}

  def aplicarFiltros(
    juegos: List[Juego],
    letra: String,
    puntajeMin: Double,
    precioOrden: String
  ): List[Juego] = {

    var resultado = juegos

    if (letra.nonEmpty) {
      resultado = resultado.filter(
        _.nombre.toLowerCase.startsWith(letra.toLowerCase)
      )
    }


    resultado = resultado.filter(_.puntaje >= puntajeMin)

    precioOrden match {
      case "asc"  => resultado = resultado.sortBy(_.precio)
      case "desc" => resultado = resultado.sortBy(-_.precio)
      case _ =>
    }

    resultado
  }

  def main(args: Array[String]): Unit = {

    val letra = if (args.length > 0) args(0) else ""
    val puntaje = if (args.length > 1) args(1).toDouble else 0.0
    val precio = if (args.length > 2) args(2) else ""

    val juegos = leerDatos()

    val filtrados =
      aplicarFiltros(juegos, letra, puntaje, precio)

    filtrados.foreach { j =>
      println(s"${j.nombre},${j.puntaje},${j.precio}")
    }
  }
}