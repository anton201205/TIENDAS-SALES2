error id: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Estadisticas.scala:scala/io/Source.
file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Estadisticas.scala
empty definition using pc, found symbol in pc: scala/io/Source.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -scala/io/Source.
	 -Source.
	 -scala/Predef.Source.
offset: 172
uri: file:///C:/Users/USER/Desktop/TIENDAS%20SALES/motor_scala/Estadisticas.scala
text:
```scala
import scala.io.Source

object Estadisticas {

  case class Juego(nombre: String, puntaje: Double)

  def leerDatos(): List[Juego] = {

    val contenido =
      S@@ource.fromFile("../datos/videojuegos.json", "UTF-8").mkString

    val patron =
      """(?s)"nombre"\s*:\s*"([^"]+)".*?"puntaje"\s*:\s*([0-9.]+)""".r

    patron.findAllMatchIn(contenido).map { m =>
      Juego(
        m.group(1),
        m.group(2).toDouble
      )
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
```


#### Short summary: 

empty definition using pc, found symbol in pc: scala/io/Source.