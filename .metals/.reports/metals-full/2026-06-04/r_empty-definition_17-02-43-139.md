error id: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala:scala/io/Source.fromFile(+1).
file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -scala/io/Source.fromFile.
	 -scala/io/Source.fromFile#
	 -scala/io/Source.fromFile().
	 -Source.fromFile.
	 -Source.fromFile#
	 -Source.fromFile().
	 -scala/Predef.Source.fromFile.
	 -scala/Predef.Source.fromFile#
	 -scala/Predef.Source.fromFile().
offset: 193
uri: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala
text:
```scala
import scala.io.Source

object Ranking {

  case class Juego(nombre: String, puntaje: Double, precio: Double)

  def leerDatos(): List[Juego] = {

    val contenido =
      Source.from@@File("../datos/videojuegos.json", "UTF-8").mkString

val patron =
  """(?s)"nombre"\s*:\s*"([^"]+)".*?"puntaje"\s*:\s*([0-9.]+).*?"precio"\s*:\s*([0-9.]+)""".r

patron.findAllMatchIn(contenido).map { m =>
  Juego(
    m.group(1),
    m.group(2).toDouble,
    m.group(3).toDouble
  )
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
```


#### Short summary: 

empty definition using pc, found symbol in pc: 