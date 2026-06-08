import scala.io.Source

object Estadisticas {

  case class Juego(nombre: String, puntaje: Double)

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
    } yield Juego(n, pt)

  }.toList
}

  def main(args: Array[String]): Unit = {

    val juegos = leerDatos()

    val puntajes = juegos.map(_.puntaje)

    val promedio =
      if (puntajes.nonEmpty) puntajes.sum / puntajes.size else 0

    val maximo =
      if (puntajes.nonEmpty) puntajes.max else 0

    val minimo =
      if (puntajes.nonEmpty) puntajes.min else 0

    println(s"PROMEDIO,$promedio")
    println(s"MAX,$maximo")
    println(s"MIN,$minimo")
    println(s"TOTAL,${juegos.size}")
  }
}