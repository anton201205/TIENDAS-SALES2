error id: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala:
file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -resultado.
	 -resultado#
	 -resultado().
	 -scala/Predef.resultado.
	 -scala/Predef.resultado#
	 -scala/Predef.resultado().
offset: 1065
uri: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Ranking.scala
text:
```scala
import scala.io.Source

object Ranking {

  case class Juego(nombre: String, puntaje: Double, precio: Double)

  def leerDatos(): List[Juego] = {

    val contenido =
      Source.fromFile("../datos/videojuegos.json", "UTF-8").mkString

    val patron =
      """(?s)"nombre"\s*:\s*"([^"]+)".*?"puntaje"\s*:\s*([0-9.]+)""".r

    patron.findAllMatchIn(contenido).map { m =>
      Juego(
        m.group(1),
        m.group(2).toDouble,
        scala.util.Random.nextInt(200) + 20 // precio simulado
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

    // 💰 orden por precio    precioOrden match {
      case "asc"  => resultado = resultado.sortBy(_.precio)
      case "desc" => result@@ado = resultado.sortBy(-_.precio)
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