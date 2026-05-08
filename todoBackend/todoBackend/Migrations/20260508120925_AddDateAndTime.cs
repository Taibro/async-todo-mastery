using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace todoBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDateAndTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "TodoItems",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "Time",
                table: "TodoItems",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "TodoItems");
        }
    }
}
